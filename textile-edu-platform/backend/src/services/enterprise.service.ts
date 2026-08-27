import { AppDataSource } from '../config/database'
import { Enterprise } from '../entities/Enterprise'
import { Like } from 'typeorm'

export class EnterpriseService {
  private enterpriseRepo = AppDataSource.getRepository(Enterprise)

  // 获取企业列表（支持分页和搜索）
  async getEnterprises(options: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
  }) {
    const { page = 1, limit = 10, search, category, status } = options
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.name = Like(`%${search}%`)
    }

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    const [list, total] = await this.enterpriseRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    })

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // 获取企业详情
  async getEnterpriseById(id: string) {
    const enterprise = await this.enterpriseRepo.findOne({
      where: { id },
    })

    if (!enterprise) {
      throw new Error('企业不存在')
    }

    return enterprise
  }

  // 获取企业画像（完整信息）
  async getEnterpriseProfile(id: string) {
    const enterprise = await this.getEnterpriseById(id)

    const siteMeta = (enterprise.analysis && (enterprise.analysis as any).site) || {}

    return {
      basic: {
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
        keyDirs: enterprise.patentsKeyDirs,
      },
      softwareCopyrights: enterprise.softwareCopyrights,
      recruitment: enterprise.recruitment,
      honors: enterprise.honors,
      risks: enterprise.risks,
      branches: enterprise.branches,
      financial: enterprise.financial,
      webNotes: enterprise.webNotes,
      analysis: enterprise.analysis,
      tenders: enterprise.tenders,
      // 站点画像扩展字段（用于复刻 `网站/index.html` 的企业画像展示）
      site: {
        rating: siteMeta.rating ?? null,
        area: siteMeta.area ?? null,
        qualsSrc: siteMeta.quals_src ?? null,
        scores: siteMeta.scores ?? null,
        demandBuckets: siteMeta.demand_buckets ?? null,
        chainNodes: siteMeta.chain_nodes ?? null,
        graphOnly: siteMeta.graph_only ?? false,
      },
      // 原始站点对象（可选，用于前端做“完全复刻”）
      siteProfile: (enterprise as any).siteProfile || null,
    }
  }

  // 获取统计数据
  async getStatistics() {
    const total = await this.enterpriseRepo.count()
    const byCategory = await this.enterpriseRepo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.category')
      .getRawMany()

    const byStatus = await this.enterpriseRepo
      .createQueryBuilder('e')
      .select('e.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.status')
      .getRawMany()

    // 专利统计
    const patentStats = await this.enterpriseRepo
      .createQueryBuilder('e')
      .select('SUM(e.patentsTotal)', 'totalPatents')
      .addSelect('AVG(e.patentsTotal)', 'avgPatents')
      .getRawOne()

    return {
      total,
      byCategory,
      byStatus,
      patents: {
        total: parseInt(patentStats.totalPatents) || 0,
        average: parseFloat(patentStats.avgPatents) || 0,
      },
    }
  }

  // 搜索推荐企业（用于产教融合）
  async getRecommendedEnterprises(criteria: {
    major?: string // 专业名称
    limit?: number
  }) {
    const { major, limit = 10 } = criteria

    // 根据分析报告中的专业匹配度推荐
    const enterprises = await this.enterpriseRepo
      .createQueryBuilder('e')
      .where("e.analysis->>'decision' = :decision", { decision: '推荐' })
      .orderBy('e.patentsTotal', 'DESC')
      .take(limit)
      .getMany()

    return enterprises.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      staffSize: e.staffSize,
      patentsTotal: e.patentsTotal,
      analysis: e.analysis,
      recruitment: e.recruitment,
    }))
  }

  // 批量创建企业
  async bulkCreate(enterprises: Partial<Enterprise>[]) {
    const entities = this.enterpriseRepo.create(enterprises)
    return await this.enterpriseRepo.save(entities)
  }

  // 更新企业信息
  async updateEnterprise(id: string, data: Partial<Enterprise>) {
    await this.enterpriseRepo.update(id, data)
    return await this.getEnterpriseById(id)
  }

  // 删除企业
  async deleteEnterprise(id: string) {
    const result = await this.enterpriseRepo.delete(id)
    return (result.affected || 0) > 0
  }
}
