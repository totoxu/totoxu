import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Empty, Spin, Tag } from 'antd'
import { industryChainApi } from '../../services/api'
import '../../components/common/ModulePlaceholder.css'
import './ChainMap.css'

interface ChainNode {
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
  children: ChainNode[]
}

interface NodeTreeResponse {
  roots: ChainNode[]
  totalRoots: number
}

interface EnterpriseListItem {
  id: string
  nodeId: string
  enterpriseId: string | null
  enterpriseName: string
  category: string
  area: string
  rating: number | null
  patentsTotal: number
  recruitmentTotal: number
  sourceType: 'profile' | 'list'
  isDeepProfile: boolean
  matchStatus: string
  nodePath: string
  nodeDisplay: string
}

interface EnterpriseDetail {
  mode: 'matched' | 'name_only'
  enterpriseId: string | null
  sourceType: 'profile' | 'list'
  matchStatus: string
  nodePath: string
  basic: Record<string, any>
  personnel?: any[]
  insuredTrend?: any[]
  patents?: Record<string, any>
  recruitment?: Record<string, any>
  honors?: string[]
  risks?: Record<string, any>
  branches?: any
  financial?: Record<string, any>
  webNotes?: string
  analysis?: Record<string, any>
  tenders?: Record<string, any>
  site?: Record<string, any>
  siteProfile?: Record<string, any>
  snapshot?: Record<string, any>
}

const formatPath = (fullPath?: string) => (fullPath || '').split('/').join(' / ')

const formatMoney = (value: any) => {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  if (n >= 10000) return `${Math.round(n / 10000)} 万元`
  return `${n} 元`
}

const insuredLatest = (insuredTrend?: any[]) => {
  if (!Array.isArray(insuredTrend) || insuredTrend.length === 0) return null
  const list = insuredTrend
    .filter((x) => x && x.year != null && x.count != null)
    .sort((a, b) => Number(a.year) - Number(b.year))
  if (!list.length) return null
  return list[list.length - 1]?.count ?? null
}

const decisionClass = (decision?: string) => {
  if (!decision) return 'is-mid'
  if (decision === '推荐') return 'is-good'
  if (decision === '回避') return 'is-bad'
  return 'is-mid'
}

const riskWarnings = (drawerData: EnterpriseDetail) => {
  const warnings: Array<{ text: string; level: 'ok' | 'warn' | 'bad' }> = []
  const risks = (drawerData.risks || {}) as any
  const labor = (risks.labor_cases || {}) as any
  const ins = insuredLatest(drawerData.insuredTrend)

  if (risks.dishonest) warnings.push({ text: '失信被执行', level: 'bad' })
  if (risks.judgment_debtor) warnings.push({ text: `被执行人 ${risks.judgment_debtor} 条`, level: 'bad' })
  if (Array.isArray(risks.business_exception) && risks.business_exception.length) warnings.push({ text: '经营异常', level: 'bad' })
  if (labor.total) warnings.push({ text: `劳动纠纷 ${labor.total} 件`, level: labor.total >= 3 ? 'bad' : 'warn' })
  if (ins != null && Number(ins) < 20) warnings.push({ text: `参保 ${ins} 人·规模小`, level: 'warn' })

  const trend = Array.isArray(drawerData.insuredTrend)
    ? drawerData.insuredTrend
        .filter((x: any) => x && x.year != null && x.count != null)
        .sort((a: any, b: any) => Number(a.year) - Number(b.year))
    : []
  if (trend.length >= 2) {
    const first = Number(trend[0].count)
    const last = Number(trend[trend.length - 1].count)
    if (!Number.isNaN(first) && !Number.isNaN(last) && last < first) {
      warnings.push({ text: '参保连年下降', level: 'warn' })
    }
  }

  if (!warnings.length) warnings.push({ text: '暂无明显风险', level: 'ok' })
  return warnings
}

const ChainMap: React.FC = () => {
  const [treeData, setTreeData] = useState<NodeTreeResponse | null>(null)
  const [treeLoading, setTreeLoading] = useState(true)
  const [treeError, setTreeError] = useState('')

  const [selectedL1Id, setSelectedL1Id] = useState('')
  const [selectedL2Id, setSelectedL2Id] = useState('')
  const [selectedL3Id, setSelectedL3Id] = useState('')

  const [search, setSearch] = useState('')
  const [sourceType, setSourceType] = useState<'all' | 'profile' | 'list'>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)

  const [listLoading, setListLoading] = useState(false)
  const [enterprises, setEnterprises] = useState<EnterpriseListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState({
    totalCount: 0,
    profileCount: 0,
    listCount: 0,
  })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [drawerData, setDrawerData] = useState<EnterpriseDetail | null>(null)

  useEffect(() => {
    const fetchTree = async () => {
      setTreeLoading(true)
      setTreeError('')
      try {
        const response = await industryChainApi.getNodes()
        const data = response.data as NodeTreeResponse
        setTreeData(data)

        const firstRoot = data.roots[0]
        const firstL2 = firstRoot?.children?.[0]
        setSelectedL1Id(firstRoot?.id || '')
        setSelectedL2Id(firstL2?.id || '')
        setSelectedL3Id('')
      } catch (error) {
        console.error(error)
        setTreeError('产业链节点加载失败，请检查后端服务或数据库连接。')
      } finally {
        setTreeLoading(false)
      }
    }

    fetchTree()
  }, [])

  const roots = treeData?.roots || []
  const selectedL1 = roots.find((item) => item.id === selectedL1Id) || roots[0]
  const l2Nodes = selectedL1?.children || []
  const selectedL2 = l2Nodes.find((item) => item.id === selectedL2Id) || l2Nodes[0]
  const l3Nodes = selectedL2?.children || []
  const selectedL3 = l3Nodes.find((item) => item.id === selectedL3Id) || null
  const l4Nodes = selectedL3
    ? selectedL3.children
    : selectedL2?.children.flatMap((item) => item.children) || []
  const currentNode = selectedL3 || selectedL2 || selectedL1 || null

  useEffect(() => {
    if (!currentNode?.id || treeLoading) return

    const fetchEnterprises = async () => {
      setListLoading(true)
      try {
        const response = await industryChainApi.getNodeEnterprises(currentNode.id, {
          page,
          limit: pageSize,
          search: search.trim() || undefined,
          sourceType: sourceType === 'all' ? undefined : sourceType,
        })
        const data = response.data
        setEnterprises(data.list || [])
        setSummary(data.summary || { totalCount: 0, profileCount: 0, listCount: 0 })
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error(error)
        setEnterprises([])
        setSummary({ totalCount: 0, profileCount: 0, listCount: 0 })
        setTotal(0)
        setTotalPages(1)
      } finally {
        setListLoading(false)
      }
    }

    fetchEnterprises()
  }, [currentNode?.id, page, pageSize, search, sourceType, treeLoading])

  const currentPath = useMemo(() => {
    if (!currentNode) return '未选择节点'
    return formatPath(currentNode.fullPath)
  }, [currentNode])

  const openEnterpriseDrawer = async (mappingId: string) => {
    setDrawerOpen(true)
    setDrawerLoading(true)
    setDrawerData(null)
    try {
      const response = await industryChainApi.getEnterpriseDetail(mappingId)
      setDrawerData(response.data as EnterpriseDetail)
    } catch (error) {
      console.error(error)
      setDrawerData(null)
    } finally {
      setDrawerLoading(false)
    }
  }

  const renderNodeButton = (
    node: ChainNode,
    selected: boolean,
    onClick: () => void,
    variant: 'l1' | 'l2' | 'l3'
  ) => (
    <button
      key={node.id}
      className={`chain-node-btn ${variant} ${selected ? 'is-active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="chain-node-main">
        <strong>{node.displayName}</strong>
        <small>{node.profileCount} 画像</small>
      </span>
      <span className="chain-node-count">{node.totalCount} 家</span>
    </button>
  )

  return (
    <div className="module-page chain-module-page">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">◎</span>
          <div>
            <h1>产业链图谱</h1>
            <p>按 4 层产业链节点展示纺织工业结构，点击节点联动下方企业列表。</p>
          </div>
        </div>
        <span className="module-tag">数据库驱动</span>
      </div>

      <div className="module-section chain-top-section">
        <div className="module-section-head">
          <span className="section-index">01</span>
          <h3>4层产业链图谱</h3>
          <div className="section-badges">
            <span className="section-badge">节点入库</span>
            <span className="section-badge">点击联动</span>
          </div>
        </div>
        <p className="section-desc">
          上方沿用原网站的层级逻辑，但改成平台统一风格。第 4 层节点当前仅展示，不参与筛选。
        </p>

        {treeLoading ? (
          <div className="chain-loading">
            <Spin />
            <span>正在加载产业链结构...</span>
          </div>
        ) : treeError ? (
          <div className="chain-error">{treeError}</div>
        ) : (
          <div className="chain-grid-board">
            <div className="chain-column">
              <div className="chain-column-title">一级 · 产业</div>
              <div className="chain-column-list">
                {roots.map((node) =>
                  renderNodeButton(node, selectedL1?.id === node.id, () => {
                    setSelectedL1Id(node.id)
                    setSelectedL2Id(node.children?.[0]?.id || '')
                    setSelectedL3Id('')
                    setPage(1)
                  }, 'l1')
                )}
              </div>
            </div>

            <div className="chain-column">
              <div className="chain-column-title">二级 · 产业环节</div>
              <div className="chain-column-list">
                {l2Nodes.map((node) =>
                  renderNodeButton(node, selectedL2?.id === node.id && !selectedL3Id, () => {
                    setSelectedL2Id(node.id)
                    setSelectedL3Id('')
                    setPage(1)
                  }, 'l2')
                )}
              </div>
            </div>

            <div className="chain-column">
              <div className="chain-column-title">三级 · 产业细分环节</div>
              <div className="chain-column-list">
                {l3Nodes.map((node) =>
                  renderNodeButton(node, selectedL3?.id === node.id, () => {
                    setSelectedL3Id((prev) => (prev === node.id ? '' : node.id))
                    setPage(1)
                  }, 'l3')
                )}
              </div>
            </div>

            <div className="chain-column is-leaf">
              <div className="chain-column-title">四级 · 细分节点展示</div>
              <div className="chain-leaf-list">
                {l4Nodes.length ? (
                  l4Nodes.map((leaf) => (
                    <span
                      key={leaf.id}
                      className={`chain-leaf-tag ${leaf.colorTag === '蓝色' ? 'is-blue' : leaf.colorTag === '橙色' ? 'is-orange' : ''}`}
                    >
                      {leaf.displayName}
                    </span>
                  ))
                ) : (
                  <span className="chain-leaf-empty">该环节暂无第 4 层细分节点</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="module-section chain-list-section">
        <div className="module-section-head">
          <span className="section-index">02</span>
          <h3>节点联动企业列表</h3>
          <div className="section-badges">
            <span className="section-badge">总数 {summary.totalCount}</span>
            <span className="section-badge">画像 {summary.profileCount}</span>
          </div>
        </div>
        <p className="section-desc">
          当前节点路径：<strong>{currentPath}</strong>
        </p>

        <div className="chain-summary-bar">
          <div className="chain-summary-item">
            <span>企业总数</span>
            <strong>{summary.totalCount}</strong>
          </div>
          <div className="chain-summary-item">
            <span>深度画像企业</span>
            <strong>{summary.profileCount}</strong>
          </div>
          <div className="chain-summary-item">
            <span>清单企业</span>
            <strong>{summary.listCount}</strong>
          </div>
        </div>

        <div className="chain-toolbar">
          <input
            className="chain-search"
            placeholder="搜索企业名称、区域或节点"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <div className="chain-filter-group">
            {[
              { value: 'all', label: '全部企业' },
              { value: 'profile', label: '深度画像' },
              { value: 'list', label: '清单企业' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                className={`chain-filter-btn ${sourceType === item.value ? 'is-active' : ''}`}
                onClick={() => {
                  setSourceType(item.value as 'all' | 'profile' | 'list')
                  setPage(1)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chain-table-wrap">
          {listLoading ? (
            <div className="chain-loading">
              <Spin />
              <span>正在加载节点企业列表...</span>
            </div>
          ) : enterprises.length === 0 ? (
            <Empty description="当前节点暂无企业数据" />
          ) : (
            <table className="chain-table">
              <thead>
                <tr>
                  <th>企业名称</th>
                  <th>节点归属</th>
                  <th>类别</th>
                  <th>区域</th>
                  <th>评级</th>
                  <th>专利</th>
                  <th>在招</th>
                  <th>口径</th>
                </tr>
              </thead>
              <tbody>
                {enterprises.map((enterprise) => (
                  <tr key={enterprise.id}>
                    <td>
                      <button
                        type="button"
                        className="chain-enterprise-link"
                        onClick={() => openEnterpriseDrawer(enterprise.id)}
                      >
                        {enterprise.enterpriseName}
                      </button>
                    </td>
                    <td>{enterprise.nodeDisplay}</td>
                    <td>{enterprise.category || '—'}</td>
                    <td>{enterprise.area || '—'}</td>
                    <td>{enterprise.rating != null ? enterprise.rating.toFixed(1) : '—'}</td>
                    <td>{enterprise.patentsTotal}</td>
                    <td>{enterprise.recruitmentTotal}</td>
                    <td>
                      <span className={`chain-source-badge ${enterprise.sourceType === 'profile' ? 'is-profile' : ''}`}>
                        {enterprise.sourceType === 'profile' ? '深度画像' : '清单企业'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="chain-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              上一页
            </button>
            <span>
              第 {page} / {totalPages} 页，共 {total} 条
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      <Drawer
        title={drawerData?.basic?.name || '企业详情'}
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerLoading ? (
          <div className="chain-loading">
            <Spin />
            <span>正在加载企业详情...</span>
          </div>
        ) : !drawerData ? (
          <Empty description="未获取到企业详情" />
        ) : (
          <div className="chain-drawer">
            <div className="chain-drawer-tags">
              <Tag color={drawerData.mode === 'matched' ? 'green' : 'default'}>
                {drawerData.mode === 'matched' ? '已匹配企业库' : '清单企业'}
              </Tag>
              <Tag color={drawerData.sourceType === 'profile' ? 'blue' : 'gold'}>
                {drawerData.sourceType === 'profile' ? '深度画像' : '清单企业'}
              </Tag>
              {drawerData.site?.qualsSrc && (
                <Tag color="geekblue">{String(drawerData.site.qualsSrc).slice(0, 16)}</Tag>
              )}
              {drawerData.site?.rating != null && (
                <Tag color="cyan">图谱评级 {Number(drawerData.site.rating).toFixed(1)}</Tag>
              )}
            </div>

            <div className="chain-drawer-section">
              <h4>节点路径</h4>
              <p>{formatPath(drawerData.nodePath)}</p>
            </div>

            {drawerData.analysis?.decision && (
              <div className="chain-drawer-section">
                <h4>求职决策</h4>
                <div className={`chain-decision ${decisionClass(drawerData.analysis.decision)}`}>
                  <div className="chain-decision-title">
                    <strong>{drawerData.analysis.decision}</strong>
                    <span>{drawerData.analysis.decision_reason || drawerData.analysis.job_view || ''}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="chain-drawer-section">
              <h4>风险摘要</h4>
              <div className="chain-risk-row">
                {riskWarnings(drawerData).map((item) => (
                  <span
                    key={item.text}
                    className={`chain-risk-pill ${item.level === 'ok' ? 'is-ok' : item.level === 'bad' ? 'is-bad' : 'is-warn'}`}
                  >
                    {item.text}
                  </span>
                ))}
              </div>
            </div>

            <div className="chain-drawer-section">
              <h4>基本信息</h4>
              <div className="chain-drawer-kv">
                <div><span>企业名称</span><strong>{drawerData.basic?.name || '—'}</strong></div>
                <div><span>企业类别</span><strong>{drawerData.basic?.category || '—'}</strong></div>
                {'area' in drawerData.basic && <div><span>所在区域</span><strong>{drawerData.basic?.area || '—'}</strong></div>}
                {'legalRep' in drawerData.basic && <div><span>法定代表人</span><strong>{drawerData.basic?.legalRep || '—'}</strong></div>}
                {'status' in drawerData.basic && <div><span>经营状态</span><strong>{drawerData.basic?.status || '—'}</strong></div>}
                {'staffSize' in drawerData.basic && <div><span>人员规模</span><strong>{drawerData.basic?.staffSize || '—'}</strong></div>}
                {'address' in drawerData.basic && (
                  <div className="is-full"><span>注册地址</span><strong>{drawerData.basic?.address || '—'}</strong></div>
                )}
                {'scopeBrief' in drawerData.basic && (
                  <div className="is-full"><span>经营范围摘要</span><strong>{drawerData.basic?.scopeBrief || '—'}</strong></div>
                )}
              </div>
            </div>

            {drawerData.mode === 'matched' && (
              <>
                <div className="chain-drawer-section">
                  <h4>专利与招聘</h4>
                  <div className="chain-drawer-kv">
                    <div><span>专利总数</span><strong>{drawerData.patents?.total || 0}</strong></div>
                    <div><span>近 3 年专利</span><strong>{drawerData.patents?.recent3y || 0}</strong></div>
                    <div><span>在招岗位</span><strong>{drawerData.recruitment?.total || 0}</strong></div>
                    <div><span>荣誉数量</span><strong>{drawerData.honors?.length || 0}</strong></div>
                  </div>
                  {!!drawerData.patents?.keyDirs?.length && (
                    <div className="chain-chip-row">
                      {drawerData.patents.keyDirs.slice(0, 8).map((item: string) => (
                        <span key={item} className="chain-chip">{item}</span>
                      ))}
                    </div>
                  )}
                </div>

                {drawerData.site?.scores && (
                  <div className="chain-drawer-section">
                    <h4>七维评分</h4>
                    <div className="chain-score-grid">
                      {[
                        '产教融合合作价值',
                        '科教融汇潜力',
                        '岗位供给与匹配',
                        '就业质量',
                        '企业稳定性',
                        '风险安全度',
                        '成长性',
                      ].map((k) => {
                        const v = Number(drawerData.site?.scores?.[k] || 0)
                        return (
                          <div key={k} className="chain-score-item">
                            <span>{k}</span>
                            <div className="chain-score-bar">
                              <i style={{ width: `${Math.min(Math.max((v / 5) * 100, 0), 100)}%` }} />
                            </div>
                            <strong>{v.toFixed(1)}</strong>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {Array.isArray(drawerData.insuredTrend) && drawerData.insuredTrend.length > 0 && (
                  <div className="chain-drawer-section">
                    <h4>参保趋势</h4>
                    <div className="chain-insured-row">
                      {drawerData.insuredTrend
                        .filter((x: any) => x && x.year)
                        .slice(-6)
                        .map((x: any) => (
                          <div key={x.year} className="chain-insured-col">
                            <strong>{x.count ?? '—'}</strong>
                            <span>{x.year}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {Array.isArray(drawerData.site?.demandBuckets) && drawerData.site.demandBuckets.length > 0 && (
                  <div className="chain-drawer-section">
                    <h4>需求侧信号（方向桶）</h4>
                    <div className="chain-chip-row">
                      {drawerData.site.demandBuckets.map((item: string) => (
                        <span key={item} className="chain-chip">{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(drawerData.recruitment?.jobs) && drawerData.recruitment.jobs.length > 0 && (
                  <div className="chain-drawer-section">
                    <h4>在招岗位（节选）</h4>
                    <div className="chain-job-table">
                      <div className="chain-job-head">
                        <span>岗位</span>
                        <span>薪资</span>
                        <span>学历</span>
                        <span>经验</span>
                      </div>
                      {drawerData.recruitment.jobs.slice(0, 6).map((job: any, idx: number) => (
                        <div className="chain-job-row" key={`${job.title || idx}-${idx}`}>
                          <strong>{job.title || '—'}</strong>
                          <span>{job.salary || '—'}</span>
                          <span>{job.edu || '—'}</span>
                          <span>{job.exp || '—'}</span>
                        </div>
                      ))}
                      {drawerData.recruitment.jobs.length > 6 && (
                        <div className="chain-job-more">还有 {drawerData.recruitment.jobs.length - 6} 条岗位明细（第一版先不全部展开）</div>
                      )}
                    </div>
                  </div>
                )}

                {drawerData.analysis && (
                  <div className="chain-drawer-section">
                    <h4>产教融合分析</h4>
                    <p>{drawerData.analysis?.brief || '暂无分析摘要'}</p>
                    {!!drawerData.analysis?.majors?.length && (
                      <div className="chain-chip-row">
                        {drawerData.analysis.majors.map((item: string) => (
                          <span key={item} className="chain-chip">{item}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {drawerData.webNotes && (
                  <div className="chain-drawer-section">
                    <h4>网络信息备注</h4>
                    <p>{drawerData.webNotes}</p>
                  </div>
                )}

                {drawerData.tenders?.summary && (
                  <div className="chain-drawer-section">
                    <h4>招投标与市场信号</h4>
                    <div className="chain-drawer-kv">
                      <div><span>中标 / 投标</span><strong>{drawerData.tenders.summary.zhongbiao || 0} / {drawerData.tenders.summary.toubiao || 0}</strong></div>
                      <div><span>作为招采方</span><strong>{drawerData.tenders.summary.zhaocai || 0}</strong></div>
                      <div className="is-full"><span>研判解读</span><strong>{drawerData.tenders.bid_view || '—'}</strong></div>
                    </div>
                    {Array.isArray(drawerData.tenders?.recent_wins) && drawerData.tenders.recent_wins.length > 0 && (
                      <div className="chain-tender-mini">
                        {drawerData.tenders.recent_wins.slice(0, 4).map((w: any, idx: number) => (
                          <div className="chain-tender-row" key={`${w.title || idx}-${idx}`}>
                            <span className="t-title">{String(w.title || '—').slice(0, 40)}</span>
                            <span className="t-meta">
                              {String(w.buyer || '—').slice(0, 14)} · {formatMoney(w.amount)} · {w.date || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {drawerData.mode === 'name_only' && drawerData.snapshot && (
              <div className="chain-drawer-section">
                <h4>源网站补充信息</h4>
                <div className="chain-drawer-kv">
                  <div><span>图谱评级</span><strong>{drawerData.snapshot.rating ?? '—'}</strong></div>
                  <div><span>原始类别</span><strong>{drawerData.snapshot.category || '—'}</strong></div>
                  <div><span>原始区域</span><strong>{drawerData.snapshot.area || '—'}</strong></div>
                  <div><span>映射状态</span><strong>{drawerData.matchStatus}</strong></div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default ChainMap
