import React, { useEffect, useRef, useState } from 'react'
import { Empty, Spin } from 'antd'
import * as echarts from 'echarts'
import { positionApi } from '../../services/api'
import '../../components/common/ModulePlaceholder.css'
import './JobMapping.css'

// ---------- 类型 ----------
interface SankeyNode {
  name: string
}

interface SankeyLink {
  source: string
  target: string
  value: number
}

interface CompetencyMapData {
  nodes: SankeyNode[]
  links: SankeyLink[]
  detailNames: string[]
}

interface PositionProfile {
  name: string
  profile: Record<string, string>
}

const PROFILE_SECTIONS = [
  { key: '学历要求', label: '学历要求' },
  { key: '岗位职责', label: '岗位职责' },
  { key: '综合能力', label: '综合能力' },
  { key: '专业知识', label: '专业知识' },
  { key: '技术技能', label: '技术技能' },
  { key: '工程实践', label: '工程实践' },
]

// ---------- 子组件：桑基图 ----------
const CompetencySankey: React.FC<{
  nodes: SankeyNode[]
  links: SankeyLink[]
  onNodeClick: (name: string) => void
}> = ({ nodes, links, onNodeClick }) => {
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

    const clickHandler = (params: any) => {
      if (params?.dataType === 'node' && params?.name) {
        onNodeClick(params.name)
      }
    }

    // 按层级分组，各列节点均匀纵向分布（上下对称、左右对称）
    const nodeDepth = new Map<string, number>()
    ;(links || []).forEach((l) => {
      if (!nodeDepth.has(l.source)) nodeDepth.set(l.source, 0)
      nodeDepth.set(l.target, 2)
    })
    ;(links || []).forEach((l) => {
      if (nodeDepth.get(l.source) === 2) nodeDepth.set(l.source, 1)
    })

    const columnGroups = new Map<number, string[]>()
    nodeDepth.forEach((depth, name) => {
      if (!columnGroups.has(depth)) columnGroups.set(depth, [])
      columnGroups.get(depth)!.push(name)
    })

    const positionedData = (nodes || []).map((n) => {
      const depth = nodeDepth.get(n.name) ?? 1
      const group = columnGroups.get(depth) || []
      const idx = group.indexOf(n.name)
      return { ...n, y: group.length ? (idx + 0.5) / group.length : 0.5 }
    })

    chart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#2d3748', fontSize: 13 },
        extraCssText: 'box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          sort: 'none',
          nodeAlign: 'justify',
          left: '4%',
          right: '4%',
          top: '4%',
          bottom: '4%',
          nodeWidth: 16,
          nodeGap: 8,
          layoutIterations: 0,
          orient: 'horizontal',
          draggable: true,
          emphasis: { focus: 'adjacency' },
          data: positionedData,
          links,
          lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.35 },
          label: { fontSize: 12.5, color: '#2d3748' },
          itemStyle: { borderWidth: 1, borderColor: '#fff' },
          levels: [
            {
              depth: 0,
              itemStyle: { color: '#4a90d9' },
              lineStyle: { color: 'source', opacity: 0.2 },
              label: { position: 'left', fontSize: 12.5 },
            },
            {
              depth: 1,
              itemStyle: { borderWidth: 2, borderColor: '#0f2c59' },
              lineStyle: { color: 'source', opacity: 0.3 },
              label: { position: 'inside', fontSize: 13, fontWeight: 'bold', color: '#0f2c59' },
            },
            {
              depth: 2,
              itemStyle: { color: '#e85d04' },
              lineStyle: { color: 'target', opacity: 0.2 },
              label: { position: 'right', fontSize: 12 },
            },
          ],
        },
      ],
    })

    chart.on('click', clickHandler)
    return () => {
      chart.off('click', clickHandler)
    }
  }, [nodes, links, onNodeClick])

  if (!nodes?.length || !links?.length) return <Empty description="暂无图谱数据" />
  return <div ref={containerRef} className="cm-chart" />
}

// ---------- 主页面 ----------
const JobMapping: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [mapData, setMapData] = useState<CompetencyMapData | null>(null)

  const [profile, setProfile] = useState<PositionProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = (await positionApi.getCompetencyMap()) as any
        if (mounted) setMapData((res?.data || res) as CompetencyMapData)
      } catch (err) {
        console.error('关键岗位能力图谱加载失败:', err)
        if (mounted) setMapData(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleNodeClick = async (name: string) => {
    setProfileError('')
    setProfile(null)
    setProfileLoading(true)
    try {
      const res = (await positionApi.getPositionDetail(name)) as any
      const data = res?.data || res
      setProfile(data as PositionProfile)
    } catch (err) {
      setProfileError(`「${name}」暂无能力画像数据（该节点为岗位类别或国家职业标准）`)
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="page-title-row">
          <div className="page-icon">◎</div>
          <div>
            <h1>岗位与职业映射图谱</h1>
            <p>关键岗位 × 岗位类别 × 国家职业标准映射（桑基图）</p>
          </div>
        </div>
        <span className="module-tag">
          {mapData ? `${mapData.detailNames.length} 个岗位画像` : '关键岗位能力图谱'}
        </span>
      </div>

      {loading ? (
        <div className="cm-loading">
          <Spin size="large" />
        </div>
      ) : !mapData ? (
        <div className="cm-empty">
          <Empty description="暂无关键岗位能力图谱数据" />
        </div>
      ) : (
        <div className="cm-layout">
          {/* 左：桑基图 */}
          <div className="cm-chart-wrap">
            <div className="cm-panel-title">关键岗位 × 岗位类别 × 国家职业标准映射（桑基图）</div>
            <CompetencySankey
              nodes={mapData.nodes}
              links={mapData.links}
              onNodeClick={handleNodeClick}
            />
            <div className="cm-hint">点击左侧关键岗位节点，可查看岗位能力画像</div>
          </div>

          {/* 右：岗位能力画像 */}
          <div className="cm-detail-wrap">
            <div className="cm-panel-title">岗位能力画像（基于2022版国家职业分类大典）</div>
            {profileLoading ? (
              <div className="cm-loading small">
                <Spin />
              </div>
            ) : profile ? (
              <div className="cm-profile">
                <div className="cm-profile-head">
                  <h3>{profile.profile['岗位名称'] || profile.name}</h3>
                  <div className="cm-profile-sub">基于《中华人民共和国职业分类大典（2022年版）》及南通本地招聘数据融合生成</div>
                </div>
                {PROFILE_SECTIONS.map((s) => {
                  const value = profile.profile[s.key]
                  if (value == null || value === '') return null
                  return (
                    <div className="cm-profile-item" key={s.key}>
                      <div className="cm-profile-label">{s.label}</div>
                      <div className="cm-profile-body">
                        {String(value)
                          .split('\n')
                          .filter((line) => line.trim())
                          .map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="cm-detail-empty">
                {profileError ? <div className="cm-error">{profileError}</div> : <Empty description="点击左侧岗位节点查看能力画像" />}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobMapping
