import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Empty, Input, Modal, Pagination, Spin, Tag } from 'antd'
import * as echarts from 'echarts'
import { industryChainApi } from '../../services/api'
import '../../components/common/ModulePlaceholder.css'
import './EnterpriseDirectory.css'

// ---------- 类型 ----------
interface DirectoryItem {
  id: string
  name: string
  category: string
  nodeId: string | null
  nodeDisplay: string
  nodePath: string
  rating: number | null
  decision: string
  decisionReason: string
  recruitmentTotal: number
  patentsTotal: number
  area: string
  demandBuckets: string[]
}

interface DirectoryResponse {
  summary: { totalCount: number }
  list: DirectoryItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface SupplyProfile {
  school: string
  major: string
  group: string | null
  bucket: string | null
  tags: string[]
  supply25: number
  courses: string[]
  skills: string[]
  certs: string[]
  coop: string
  research: string
  goal: string
}

interface ModalData {
  enterpriseId: string
  name: string
  category: string
  area: string
  rating: number | null
  graphOnly: boolean
  scores: Record<string, number> | null
  analysis: {
    brief: string
    majors: string[]
    eduView: string
    jobView: string
    riskFlags: string[]
    decision: string
    decisionReason: string
  }
  qualsSrc: string | null
  honors: string[]
  demandBuckets: string[]
  recruitment: { total?: number; jobs?: any[] } | null
  insuredTrend: { year?: number; count?: number }[]
  risks: Record<string, any> | null
  tenders: Record<string, any> | null
  webNotes: string | null
  supplyProfiles: SupplyProfile[]
  supplyTotal: number
}

// ---------- 常量 ----------
const CATEGORIES = ['全部板块', '原材料生产', '加工制造', '专用设备制造', '产品销售和流通', '品牌与研发设计', '纺织工业']

const DECISION_META: Record<string, { label: string; cls: string }> = {
  推荐: { label: '推荐', cls: 'g' },
  谨慎: { label: '谨慎', cls: 'a' },
  回避: { label: '回避', cls: 'r' },
}

const decisionMeta = (decision: string) => DECISION_META[decision] || { label: decision || '谨慎', cls: 'a' }

const DIM_ORDER = [
  '产教融合合作价值',
  '科教融汇潜力',
  '岗位供给与匹配',
  '就业质量',
  '企业稳定性',
  '风险安全度',
  '成长性',
]

// ---------- 子组件：能力雷达图 ----------
const RadarChart: React.FC<{ scores: Record<string, number> | null }> = ({ scores }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    chartRef.current ||= echarts.init(containerRef.current, undefined, { renderer: 'canvas' })
    return () => {
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    const dims = DIM_ORDER.filter((d) => scores?.[d] != null)
    const values = dims.map((d) => Math.min(5, Math.max(0, scores?.[d] ?? 0)))

    chart.setOption({
      tooltip: {},
      radar: {
        indicator: dims.map((d) => ({ name: d, max: 5 })),
        radius: '68%',
        axisName: { color: '#5f7574', fontSize: 12 },
        splitLine: { lineStyle: { color: '#e3ebe9' } },
        splitArea: { areaStyle: { color: ['#ffffff', '#f6faf9'] } },
        axisLine: { lineStyle: { color: '#e3ebe9' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: values,
              name: '能力评分',
              areaStyle: { color: 'rgba(12, 138, 116, 0.22)' },
              lineStyle: { color: '#0c8a74', width: 2 },
              itemStyle: { color: '#0c8a74' },
            },
          ],
        },
      ],
    })
  }, [scores])

  return <div ref={containerRef} className="radar-box" />
}

// ---------- 主页面 ----------
const EnterpriseDirectory: React.FC = () => {
  const [list, setList] = useState<DirectoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [decision, setDecision] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalData, setModalData] = useState<ModalData | null>(null)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = (await industryChainApi.getDirectoryEnterprises({
        page,
        limit: pageSize,
        search: search || undefined,
        category: category || undefined,
        decision: decision || undefined,
      })) as any
      const data = (res?.data || res) as DirectoryResponse
      setList(data.list || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('企业名录加载失败:', err)
      setList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, category, decision])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const openModal = async (item: DirectoryItem) => {
    setModalOpen(true)
    setModalLoading(true)
    setModalData(null)
    try {
      const res = (await industryChainApi.getEnterpriseModal(item.id)) as any
      setModalData((res?.data || res) as ModalData)
    } catch (err) {
      console.error('企业画像加载失败:', err)
      setModalData(null)
    } finally {
      setModalLoading(false)
    }
  }

  const insuredLatest = (trend: { year?: number; count?: number }[]): number | null => {
    if (!trend?.length) return null
    const withCount = trend.filter((x) => x.count != null)
    if (!withCount.length) return null
    const last = withCount[withCount.length - 1]
    return typeof last.count === 'number' ? last.count : null
  }

  const renderDecisionTag = (decision: string) => {
    const meta = decisionMeta(decision)
    return <span className={`decision-badge ${meta.cls}`}>{meta.label}</span>
  }

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="page-title-row">
          <div className="page-icon">◈</div>
          <div>
            <h1>企业名录</h1>
            <p>纺织工业产业链深度画像企业名录，点击企业查看完整画像</p>
          </div>
        </div>
        <span className="module-tag">深度画像企业 · {total} 家</span>
      </div>

      {/* 筛选区 */}
      <div className="dir-filterbar">
        <Input.Search
          placeholder="搜索企业名称 / 节点 / 区域"
          allowClear
          onSearch={(v) => {
            setPage(1)
            setSearch(v.trim())
          }}
          style={{ width: 280 }}
        />
        <div className="chip-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === (cat === '全部板块' ? '' : cat) ? 'active' : ''}`}
              onClick={() => {
                setPage(1)
                setCategory(cat === '全部板块' ? '' : cat)
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="chip-row">
          {['全部评级', '推荐', '谨慎', '回避'].map((d) => (
            <button
              key={d}
              className={`chip dec ${decision === (d === '全部评级' ? '' : d) ? 'active' : ''}`}
              onClick={() => {
                setPage(1)
                setDecision(d === '全部评级' ? '' : d)
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div className="dir-table-wrap">
        {loading ? (
          <div className="dir-empty">
            <Spin />
          </div>
        ) : list.length === 0 ? (
          <div className="dir-empty">
            <Empty description="暂无深度画像企业" />
          </div>
        ) : (
          <table className="dir-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>企业名称</th>
                <th>产业链节点</th>
                <th>图谱评级</th>
                <th>求职决策</th>
                <th>在招岗位</th>
                <th>专利总数</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} className="dir-row" onClick={() => openModal(item)}>
                  <td>
                    <span className="dir-name">{item.name}</span>
                    <span className="dir-area">{item.area}</span>
                  </td>
                  <td>
                    <span className="dir-node">{item.nodeDisplay}</span>
                    {item.nodePath ? <span className="dir-path">{item.nodePath}</span> : null}
                  </td>
                  <td className="dir-num">{item.rating != null ? item.rating.toFixed(1) : '—'}</td>
                  <td>{renderDecisionTag(item.decision)}</td>
                  <td className="dir-num">{item.recruitmentTotal}</td>
                  <td className="dir-num">{item.patentsTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dir-pagination">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          showTotal={(t) => `共 ${t} 家企业`}
          onChange={(p, ps) => {
            setPage(p)
            setPageSize(ps)
          }}
        />
      </div>

      {/* 画像弹窗 */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={1080}
        centered
        destroyOnClose
        className="edir-modal"
        title={null}
      >
        {modalLoading ? (
          <div className="edir-loading">
            <Spin size="large" />
          </div>
        ) : !modalData ? (
          <div className="edir-loading">
            <Empty description="企业画像加载失败" />
          </div>
        ) : (
          <EnterpriseModalBody data={modalData} insuredLatest={insuredLatest} />
        )}
      </Modal>
    </div>
  )
}

// ---------- 弹窗主体 ----------
const EnterpriseModalBody: React.FC<{
  data: ModalData
  insuredLatest: (trend: { year?: number; count?: number }[]) => number | null
}> = ({ data, insuredLatest }) => {
  const meta = decisionMeta(data.analysis.decision)
  const jobs = data.recruitment?.jobs?.slice(0, 8) || []
  const scores = data.scores
  const dims = DIM_ORDER.filter((d) => scores?.[d] != null)

  return (
    <div className="edir-body">
      {/* 头部 */}
      <div className="edir-head">
        <div className="edir-head-main">
          <div className="edir-name-row">
            <h3>{data.name}</h3>
            <span className={`decision-badge ${meta.cls}`}>{meta.label}</span>
          </div>
          <div className="edir-tags">
            {data.category ? <Tag className="edir-tag">{data.category}</Tag> : null}
            {data.area && data.area !== '—' ? <Tag className="edir-tag">{data.area}</Tag> : null}
            {data.rating != null ? <Tag className="edir-tag">图谱评级 {data.rating.toFixed(1)}</Tag> : null}
            {data.analysis.majors.slice(0, 4).map((m) => (
              <Tag className="edir-tag" key={m}>
                {m}
              </Tag>
            ))}
          </div>
          {data.analysis.brief ? <p className="edir-brief">{data.analysis.brief}</p> : null}
        </div>
      </div>

      {/* 决策卡 */}
      <div className={`edir-decision ${meta.cls}`}>
        <span className="edir-decision-big">{meta.label}</span>
        <p>{data.analysis.decisionReason || data.analysis.jobView || '暂无决策说明'}</p>
      </div>

      {/* 1. 企业能力分析 */}
      <div className="edir-sec">
        <div className="edir-sec-head">
          <span className="section-index">01</span>
          <h4>企业能力分析</h4>
          <span className="edir-sec-note">七维能力评分（满分 5 分）</span>
        </div>
        <div className="edir-radar-grid">
          <RadarChart scores={scores} />
          <div className="edir-scores">
            {dims.length === 0 ? (
              <Empty description="暂无能力评分" />
            ) : (
              dims.map((d) => {
                const v = Math.min(5, Math.max(0, scores?.[d] ?? 0))
                return (
                  <div className="edir-score-row" key={d}>
                    <span className="edir-score-lb">{d}</span>
                    <div className="edir-score-track">
                      <div className="edir-score-fill" style={{ width: `${(v / 5) * 100}%` }} />
                    </div>
                    <span className="edir-score-num">{v.toFixed(1)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* 2. 产教合作评估 */}
      <div className="edir-sec">
        <div className="edir-sec-head">
          <span className="section-index">02</span>
          <h4>产教合作评估</h4>
        </div>
        <div className="edir-coop">
          <div className="edir-coop-card edu">
            <h5>院校合作视角</h5>
            <p>{data.analysis.eduView || '暂无合作视角分析'}</p>
          </div>
          <div className="edir-coop-card job">
            <h5>岗位与就业视角</h5>
            <p>{data.analysis.jobView || '暂无就业视角分析'}</p>
          </div>
        </div>
        {(data.qualsSrc || data.honors.length > 0) && (
          <div className="edir-quals">
            <span className="edir-quals-lb">资质荣誉</span>
            {data.qualsSrc
              ? data.qualsSrc.split(/[，,、]/).filter(Boolean).slice(0, 5).map((q) => (
                  <Tag className="edir-tag qual" key={q}>
                    {q}
                  </Tag>
                ))
              : null}
            {data.honors.slice(0, 5).map((h) => (
              <Tag className="edir-tag qual" key={h}>
                {h}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* 3. 人才需求实况 */}
      <div className="edir-sec">
        <div className="edir-sec-head">
          <span className="section-index">03</span>
          <h4>人才需求实况</h4>
          {data.recruitment?.total != null ? (
            <span className="edir-sec-note">在招 {data.recruitment.total} 个岗位</span>
          ) : null}
        </div>
        <div className="edir-kpis">
          <div className="edir-kpi">
            <div className="edir-kpi-v">{data.recruitment?.total ?? '—'}</div>
            <div className="edir-kpi-k">在招岗位</div>
          </div>
          <div className="edir-kpi">
            <div className="edir-kpi-v">{insuredLatest(data.insuredTrend) ?? '—'}</div>
            <div className="edir-kpi-k">最新参保人数</div>
          </div>
          <div className="edir-kpi">
            <div className="edir-kpi-v">{data.demandBuckets.length}</div>
            <div className="edir-kpi-k">需求方向</div>
          </div>
        </div>
        {data.demandBuckets.length > 0 && (
          <div className="edir-bucket-row">
            {data.demandBuckets.map((b) => (
              <Tag className="edir-tag bucket" key={b}>
                {b}
              </Tag>
            ))}
          </div>
        )}
        {jobs.length > 0 ? (
          <table className="edir-job-tb">
            <thead>
              <tr>
                <th>岗位名称</th>
                <th>薪资</th>
                <th>经验</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j, idx) => (
                <tr key={idx}>
                  <td className="edir-job-title">{j.title || '—'}</td>
                  <td>{j.salary || j.salary_range || '—'}</td>
                  <td>{j.experience || j.exp || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {/* 4. 对口院校供给 */}
      <div className="edir-sec">
        <div className="edir-sec-head">
          <span className="section-index">04</span>
          <h4>对口院校供给</h4>
          <span className="edir-sec-note">{data.supplyTotal} 个专业将其列为强对口</span>
        </div>
        {data.supplyProfiles.length === 0 ? (
          <Empty description="暂无强对口专业数据" />
        ) : (
          <div className="edir-supply-grid">
            {data.supplyProfiles.slice(0, 12).map((p, idx) => (
              <div className="edir-supply-card" key={`${p.school}-${p.major}`}>
                <div className="edir-supply-head">
                  <span className="edir-supply-school">{p.school}</span>
                  <span className="edir-supply-num">{p.supply25 ?? '—'}人</span>
                </div>
                <div className="edir-supply-major">{p.major}</div>
                {p.group ? <div className="edir-supply-group">{p.group}</div> : null}
                {p.bucket ? <div className="edir-supply-bucket">{p.bucket}</div> : null}
                {p.tags.length > 0 ? (
                  <div className="edir-supply-tags">
                    {p.tags.map((t) => (
                      <span className="edir-supply-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 风险摘要 */}
      {data.analysis.riskFlags.length > 0 || data.webNotes ? (
        <div className="edir-sec">
          <div className="edir-sec-head">
            <span className="section-index">05</span>
            <h4>风险提示</h4>
          </div>
          {data.analysis.riskFlags.map((f, idx) => (
            <div className="edir-flag warn" key={idx}>
              {f}
            </div>
          ))}
          {data.webNotes ? <div className="edir-flag info">{data.webNotes}</div> : null}
        </div>
      ) : null}
    </div>
  )
}

export default EnterpriseDirectory
