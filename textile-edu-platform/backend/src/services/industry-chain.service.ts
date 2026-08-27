import { In } from 'typeorm'
import { AppDataSource } from '../config/database'
import { Enterprise } from '../entities/Enterprise'
import { IndustryChainNode } from '../entities/IndustryChainNode'
import { IndustryChainNodeEnterprise } from '../entities/IndustryChainNodeEnterprise'
import { EduMajorProfile } from '../entities/EduMajorProfile'
import { EduMajorProfileEnterprise } from '../entities/EduMajorProfileEnterprise'
import { TechFrontierReport } from '../entities/TechFrontierReport'
import { TechOverviewReport } from '../entities/TechOverviewReport'

type NodeTreeItem = {
  id: string
  level: number
  parentId: string | null
  rawName: string
  displayName: string
  fullPath: string
  colorTag: string | null
  isClickable: boolean
  isLeafDisplayOnly: boolean
  totalCount: number
  profileCount: number
  children: NodeTreeItem[]
}

export class IndustryChainService {
  private nodeRepo = AppDataSource.getRepository(IndustryChainNode)
  private mappingRepo = AppDataSource.getRepository(IndustryChainNodeEnterprise)
  private enterpriseRepo = AppDataSource.getRepository(Enterprise)
  private majorProfileRepo = AppDataSource.getRepository(EduMajorProfile)
  private majorMappingRepo = AppDataSource.getRepository(EduMajorProfileEnterprise)
  private techFrontierRepo = AppDataSource.getRepository(TechFrontierReport)
  private techOverviewRepo = AppDataSource.getRepository(TechOverviewReport)

  private async getAllNodes() {
    return this.nodeRepo.find({
      order: {
        level: 'ASC',
        displayOrder: 'ASC',
        createdAt: 'ASC',
      },
    })
  }

  private buildTree(
    nodes: IndustryChainNode[],
    directCounts: Map<string, { totalCount: number; profileCount: number }>
  ) {
    const childrenMap = new Map<string | null, IndustryChainNode[]>()

    nodes.forEach((node) => {
      const list = childrenMap.get(node.parentId ?? null) || []
      list.push(node)
      childrenMap.set(node.parentId ?? null, list)
    })

    const walk = (node: IndustryChainNode): NodeTreeItem => {
      const childNodes = (childrenMap.get(node.id) || []).map(walk)
      const ownCount = directCounts.get(node.id) || { totalCount: 0, profileCount: 0 }
      const childCount = childNodes.reduce(
        (acc, child) => {
          acc.totalCount += child.totalCount
          acc.profileCount += child.profileCount
          return acc
        },
        { totalCount: 0, profileCount: 0 }
      )

      return {
        id: node.id,
        level: node.level,
        parentId: node.parentId,
        rawName: node.rawName,
        displayName: node.displayName,
        fullPath: node.fullPath,
        colorTag: node.colorTag,
        isClickable: node.isClickable,
        isLeafDisplayOnly: node.isLeafDisplayOnly,
        totalCount: ownCount.totalCount + childCount.totalCount,
        profileCount: ownCount.profileCount + childCount.profileCount,
        children: childNodes,
      }
    }

    return (childrenMap.get(null) || []).map(walk)
  }

  private async getDirectCountMap() {
    const rawCounts = await this.mappingRepo
      .createQueryBuilder('mapping')
      .select('mapping.nodeId', 'nodeId')
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect(
        'SUM(CASE WHEN mapping.isDeepProfile = true THEN 1 ELSE 0 END)',
        'profileCount'
      )
      .where('mapping.isCounted = :isCounted', { isCounted: true })
      .groupBy('mapping.nodeId')
      .getRawMany()

    return new Map(
      rawCounts.map((item) => [
        item.nodeId,
        {
          totalCount: parseInt(item.totalCount, 10) || 0,
          profileCount: parseInt(item.profileCount, 10) || 0,
        },
      ])
    )
  }

  private collectDescendantIds(nodeId: string, nodes: IndustryChainNode[]) {
    const childrenMap = new Map<string, IndustryChainNode[]>()

    nodes.forEach((node) => {
      if (!node.parentId) return
      const list = childrenMap.get(node.parentId) || []
      list.push(node)
      childrenMap.set(node.parentId, list)
    })

    const result = new Set<string>()
    const walk = (currentId: string) => {
      result.add(currentId)
      ;(childrenMap.get(currentId) || []).forEach((child) => walk(child.id))
    }

    walk(nodeId)
    return [...result]
  }

  async getNodeTree() {
    const nodes = await this.getAllNodes()
    const countMap = await this.getDirectCountMap()
    const tree = this.buildTree(nodes, countMap)

    return {
      roots: tree,
      totalRoots: tree.length,
    }
  }

  async getNodeSummary(nodeId: string) {
    const nodes = await this.getAllNodes()
    const targetNode = nodes.find((node) => node.id === nodeId)

    if (!targetNode) {
      throw new Error('产业链节点不存在')
    }

    const descendants = this.collectDescendantIds(nodeId, nodes)
    const mappings = await this.mappingRepo.find({
      where: descendants.map((id) => ({ nodeId: id, isCounted: true })),
    })

    const totalCount = mappings.length
    const profileCount = mappings.filter((item) => item.isDeepProfile).length

    return {
      node: {
        id: targetNode.id,
        level: targetNode.level,
        displayName: targetNode.displayName,
        rawName: targetNode.rawName,
        fullPath: targetNode.fullPath,
      },
      totalCount,
      profileCount,
      listCount: totalCount - profileCount,
    }
  }

  async getNodeEnterprises(
    nodeId: string,
    options: {
      page?: number
      limit?: number
      search?: string
      sourceType?: string
    }
  ) {
    const { page = 1, limit = 10, search = '', sourceType = '' } = options
    const nodes = await this.getAllNodes()
    const targetNode = nodes.find((node) => node.id === nodeId)

    if (!targetNode) {
      throw new Error('产业链节点不存在')
    }

    const descendants = this.collectDescendantIds(nodeId, nodes)
    const relatedMappings = await this.mappingRepo.find({
      where: descendants.map((id) => ({ nodeId: id, isCounted: true })),
      order: {
        isDeepProfile: 'DESC',
        enterpriseNameRaw: 'ASC',
      },
    })

    const enterpriseIds = relatedMappings
      .map((item) => item.enterpriseId)
      .filter((id): id is string => Boolean(id))

    const enterprises = enterpriseIds.length
      ? await this.enterpriseRepo.findBy({ id: In(enterpriseIds) })
      : []

    const enterpriseMap = new Map(enterprises.map((enterprise) => [enterprise.id, enterprise]))
    const nodeMap = new Map(nodes.map((node) => [node.id, node]))

    const merged = relatedMappings.map((mapping) => {
      const enterprise = mapping.enterpriseId ? enterpriseMap.get(mapping.enterpriseId) : null
      const snapshot = mapping.sourceSnapshot || {}
      const recruitmentTotal =
        typeof enterprise?.recruitment?.total === 'number'
          ? enterprise.recruitment.total
          : typeof snapshot.recruitment?.total === 'number'
            ? snapshot.recruitment.total
            : 0

      const patentTotal =
        typeof enterprise?.patentsTotal === 'number'
          ? enterprise.patentsTotal
          : typeof snapshot.patents?.total === 'number'
            ? snapshot.patents.total
            : 0

      return {
        id: mapping.id,
        nodeId: mapping.nodeId,
        enterpriseId: mapping.enterpriseId,
        enterpriseName: enterprise?.name || mapping.enterpriseNameRaw,
        category: enterprise?.category || mapping.enterpriseCategoryRaw || snapshot.category || '—',
        area: mapping.areaRaw || snapshot.area || '—',
        rating:
          mapping.ratingRaw != null
            ? Number(mapping.ratingRaw)
            : snapshot.rating != null
              ? Number(snapshot.rating)
              : null,
        patentsTotal: patentTotal,
        recruitmentTotal,
        sourceType: mapping.sourceType,
        isDeepProfile: mapping.isDeepProfile,
        matchStatus: mapping.matchStatus,
        nodePath:
          nodeMap.get(mapping.nodeId)?.fullPath ||
          mapping.mappingPathRaw ||
          targetNode.fullPath,
        nodeDisplay:
          nodeMap.get(mapping.nodeId)?.displayName ||
          mapping.mappingPathRaw.split('/').slice(-1)[0] ||
          targetNode.displayName,
      }
    })

    const filtered = merged.filter((item) => {
      if (sourceType && item.sourceType !== sourceType) return false
      if (search) {
        const keyword = search.trim().toLowerCase()
        const haystack = `${item.enterpriseName} ${item.category} ${item.area} ${item.nodeDisplay}`.toLowerCase()
        if (!haystack.includes(keyword)) return false
      }
      return true
    })

    const start = (page - 1) * limit
    const list = filtered.slice(start, start + limit)

    return {
      node: {
        id: targetNode.id,
        level: targetNode.level,
        displayName: targetNode.displayName,
        fullPath: targetNode.fullPath,
      },
      summary: {
        totalCount: filtered.length,
        profileCount: filtered.filter((item) => item.isDeepProfile).length,
        listCount: filtered.filter((item) => !item.isDeepProfile).length,
      },
      list,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    }
  }

  async getEnterpriseDetail(mappingId: string) {
    const mapping = await this.mappingRepo.findOne({
      where: { id: mappingId },
    })

    if (!mapping) {
      throw new Error('节点企业映射不存在')
    }

    const snapshot = mapping.sourceSnapshot || {}
    const node = await this.nodeRepo.findOne({
      where: { id: mapping.nodeId },
    })

    if (!mapping.enterpriseId) {
      return {
        mode: 'name_only',
        enterpriseId: null,
        sourceType: mapping.sourceType,
        matchStatus: mapping.matchStatus,
        nodePath: node?.fullPath || mapping.mappingPathRaw,
        basic: {
          name: mapping.enterpriseNameRaw,
          category: mapping.enterpriseCategoryRaw || snapshot.category || '清单企业',
          area: mapping.areaRaw || snapshot.area || '—',
          rating:
            mapping.ratingRaw != null
              ? Number(mapping.ratingRaw)
              : snapshot.rating != null
                ? Number(snapshot.rating)
                : null,
        },
        snapshot,
      }
    }

    const enterprise = await this.enterpriseRepo.findOne({
      where: { id: mapping.enterpriseId },
    })

    if (!enterprise) {
      return {
        mode: 'name_only',
        enterpriseId: null,
        sourceType: mapping.sourceType,
        matchStatus: 'name_only',
        nodePath: node?.fullPath || mapping.mappingPathRaw,
        basic: {
          name: mapping.enterpriseNameRaw,
          category: mapping.enterpriseCategoryRaw || snapshot.category || '清单企业',
          area: mapping.areaRaw || snapshot.area || '—',
          rating:
            mapping.ratingRaw != null
              ? Number(mapping.ratingRaw)
              : snapshot.rating != null
                ? Number(snapshot.rating)
                : null,
        },
        snapshot,
      }
    }

    const siteMeta = (enterprise.analysis && (enterprise.analysis as any).site) || {}

    return {
      mode: 'matched',
      enterpriseId: enterprise.id,
      sourceType: mapping.sourceType,
      matchStatus: mapping.matchStatus,
      nodePath: node?.fullPath || mapping.mappingPathRaw,
      basic: {
        id: enterprise.id,
        name: enterprise.name,
        category: enterprise.category,
        legalRep: enterprise.legalRep,
        regCapital: enterprise.regCapital,
        founded: enterprise.founded,
        status: enterprise.status,
        staffSize: enterprise.staffSize,
        address: enterprise.address,
        industry: enterprise.industry,
        scopeBrief: enterprise.scopeBrief,
        companyType: enterprise.companyType,
      },
      personnel: enterprise.personnel,
      insuredTrend: enterprise.insuredTrend,
      patents: {
        total: enterprise.patentsTotal,
        invention: enterprise.patentsInvention,
        utility: enterprise.patentsUtility,
        design: enterprise.patentsDesign,
        recent3y: enterprise.patentsRecent3y,
        keyDirs: enterprise.patentsKeyDirs || [],
      },
      recruitment: enterprise.recruitment,
      honors: enterprise.honors,
      risks: enterprise.risks,
      branches: enterprise.branches,
      financial: enterprise.financial,
      webNotes: enterprise.webNotes,
      analysis: enterprise.analysis,
      tenders: enterprise.tenders,
      site: {
        rating: siteMeta.rating ?? null,
        area: siteMeta.area ?? null,
        qualsSrc: siteMeta.quals_src ?? null,
        scores: siteMeta.scores ?? null,
        demandBuckets: siteMeta.demand_buckets ?? null,
        chainNodes: siteMeta.chain_nodes ?? null,
        graphOnly: siteMeta.graph_only ?? false,
      },
      siteProfile: (enterprise as any).siteProfile || null,
      snapshot,
    }
  }

  // ---------- 企业名录（仅深度画像企业） ----------

  private isDeepProfileEnterprise(enterprise: Enterprise): boolean {
    const site = (enterprise as any).siteProfile
    if (site && typeof site === 'object') {
      // 站点画像存在：未显式标记 graph_only 即视为深度画像（原站口径）
      if (typeof site.graph_only === 'boolean') return site.graph_only === false
      return true
    }
    // 完全没有站点画像的企业，不进入名录
    return false
  }

  /**
   * 名录列表：全局深度画像企业（去重），按企业主表返回。
   */
  async getDirectoryEnterprises(options: {
    page?: number
    limit?: number
    search?: string
    category?: string
    decision?: string
  }) {
    const { page = 1, limit = 10, search = '', category = '', decision = '' } = options

    const allEnterprises = await this.enterpriseRepo.find({
      order: { name: 'ASC' },
    })
    const deepProfiles = allEnterprises.filter((ent) => this.isDeepProfileEnterprise(ent))

    // 节点映射：每个企业取“最深层级”的推荐映射
    const mappings = await this.mappingRepo.find()
    const nodes = await this.getAllNodes()
    const nodeMap = new Map(nodes.map((node) => [node.id, node]))

    const mappingByEnterprise = new Map<string, IndustryChainNodeEnterprise>()
    for (const mapping of mappings) {
      if (!mapping.enterpriseId) continue
      const existing = mappingByEnterprise.get(mapping.enterpriseId)
      const node = nodeMap.get(mapping.nodeId)
      const nodeLevel = node?.level ?? 0
      const existingNodeLevel = existing ? (nodeMap.get(existing.nodeId)?.level ?? 0) : 0
      if (!existing || nodeLevel > existingNodeLevel) {
        mappingByEnterprise.set(mapping.enterpriseId, mapping)
      }
    }

    const merged = deepProfiles.map((ent) => {
      const site = (ent as any).siteProfile || {}
      const analysisSite = (ent.analysis as any)?.site || {}
      const snapshot = { ...site, ...analysisSite }

      const mapping = mappingByEnterprise.get(ent.id)
      const node = mapping ? nodeMap.get(mapping.nodeId) : null

      const rating =
        site.rating != null
          ? Number(site.rating)
          : snapshot.rating != null
            ? Number(snapshot.rating)
            : null

      const decision = site.analysis?.decision || '谨慎'
      const recruitmentTotal =
        typeof site.recruitment?.total === 'number'
          ? site.recruitment.total
          : typeof ent.recruitment?.total === 'number'
            ? ent.recruitment.total
            : 0

      const patentTotal =
        typeof site.patents?.total === 'number'
          ? site.patents.total
          : typeof ent.patentsTotal === 'number'
            ? ent.patentsTotal
            : 0

      return {
        id: ent.id,
        name: ent.name,
        category: site.category || ent.category || '纺织工业',
        nodeId: mapping?.nodeId || null,
        nodeDisplay: node?.displayName || mapping?.mappingPathRaw?.split('/').slice(-1)[0] || '—',
        nodePath: node?.fullPath || mapping?.mappingPathRaw || '',
        rating,
        decision,
        decisionReason: site.analysis?.decision_reason || '',
        recruitmentTotal,
        patentsTotal: patentTotal,
        area: site.area || analysisSite.area || '—',
        demandBuckets: site.demand_buckets || analysisSite.demand_buckets || [],
      }
    })

    const filtered = merged.filter((item) => {
      if (category && item.category !== category) return false
      if (decision && item.decision !== decision) return false
      if (search) {
        const keyword = search.trim().toLowerCase()
        const haystack = `${item.name} ${item.category} ${item.nodeDisplay} ${item.area} ${item.demandBuckets.join(' ')}`.toLowerCase()
        if (!haystack.includes(keyword)) return false
      }
      return true
    })

    const start = (page - 1) * limit
    const list = filtered.slice(start, start + limit)

    return {
      summary: {
        totalCount: filtered.length,
      },
      list,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    }
  }

  /**
   * 画像弹窗：企业能力分析 + 产教合作评估 + 人才需求实况 + 对口院校供给。
   */
  async getEnterpriseModal(enterpriseId: string) {
    const enterprise = await this.enterpriseRepo.findOne({
      where: { id: enterpriseId },
    })

    if (!enterprise) {
      throw new Error('企业不存在')
    }

    const site = (enterprise as any).siteProfile || {}
    const analysisSite = (enterprise.analysis as any)?.site || {}
    const analysis = site.analysis || {}

    // 对口院校供给：反向 strongCos 匹配
    const majorMappings = await this.majorMappingRepo.find({
      where: { enterpriseId },
    })
    const profileIds = [...new Set(majorMappings.map((item) => item.profileId))]
    const profiles = profileIds.length
      ? await this.majorProfileRepo.findBy({ id: In(profileIds) })
      : []

    const supplyProfiles = profiles.map((profile) => ({
      school: profile.school,
      major: profile.major,
      group: profile.group,
      bucket: profile.bucket,
      tags: profile.tags || [],
      supply25: profile.supply25,
      courses: profile.courses || [],
      skills: profile.skills || [],
      certs: profile.certs || [],
      coop: profile.coop,
      research: profile.research,
      goal: profile.goal,
    }))

    return {
      enterpriseId: enterprise.id,
      name: enterprise.name,
      category: site.category || enterprise.category || '纺织工业',
      area: site.area || analysisSite.area || '—',
      rating: site.rating != null ? Number(site.rating) : null,
      graphOnly: site.graph_only === true,

      // 企业能力分析
      scores: site.scores || null,
      analysis: {
        brief: analysis.brief || '',
        majors: analysis.majors || [],
        eduView: analysis.edu_view || '',
        jobView: analysis.job_view || '',
        riskFlags: analysis.risk_flags || [],
        decision: analysis.decision || '谨慎',
        decisionReason: analysis.decision_reason || '',
      },

      // 产教合作评估
      qualsSrc: site.quals_src || null,
      honors: site.honors || [],
      demandBuckets: site.demand_buckets || analysisSite.demand_buckets || [],

      // 人才需求实况
      recruitment: site.recruitment || enterprise.recruitment || null,
      insuredTrend: site.insured_trend || enterprise.insuredTrend || [],

      // 风险
      risks: site.risks || enterprise.risks || null,
      tenders: site.tenders || enterprise.tenders || null,
      webNotes: site.web_notes || enterprise.webNotes || null,

      // 对口院校供给
      supplyProfiles,
      supplyTotal: supplyProfiles.length,
    }
  }

  /**
   * 技术前沿分析报告（来自 dist_web_publish/index.html 的 techFrontierData）。
   */
  async getTechFrontier(majorKey?: string) {
    const report = majorKey
      ? await this.techFrontierRepo.findOne({ where: { majorKey } })
      : await this.techFrontierRepo.find({ order: { createdAt: 'ASC' }, take: 1 })

    if (!report || (Array.isArray(report) && report.length === 0)) {
      throw new Error('技术前沿分析数据不存在')
    }

    const item = Array.isArray(report) ? report[0] : report
    return {
      majorKey: item.majorKey,
      majorName: item.majorName,
      region: item.region,
      years: item.years,
      data: item.data,
    }
  }

  /**
   * 技术前沿分析-总览（来自 dist_web_publish/patent_dashboard_data.js）。
   */
  async getTechOverview() {
    const report = await this.techOverviewRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    })

    if (!report.length) {
      throw new Error('技术前沿总览数据不存在')
    }

    const item = report[0]
    return {
      schoolName: item.schoolName,
      data: item.data,
    }
  }
}
