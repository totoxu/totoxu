import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Empty, Select, Spin } from 'antd'
import * as echarts from 'echarts'
import { positionApi } from '../../services/api'
import '../../components/common/ModulePlaceholder.css'
import './AbilityGraph.css'

// ---------- 类型 ----------
interface JobTask {
  duty: string
  id: string
  task: string
  skill: string
  knowledge?: string
  course?: string
}

interface JobItem {
  tasks: JobTask[]
  sankeyLinks: { source: string; target: string; value: number }[]
}

interface JobCompetencyData {
  positions: Record<string, JobItem>
  positionNames: string[]
}

// ---------- 图表组件 ----------
const useChart = () => {
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

  return { containerRef, chartRef }
}

// 岗位能力模型雷达图（各职责维度任务数）
const JobRadarChart: React.FC<{ job: JobItem; jobName: string }> = ({ job, jobName }) => {
  const { containerRef, chartRef } = useChart()

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !job) return

    const dutyCounts: Record<string, number> = {}
    ;(job.tasks || []).forEach((t) => {
      if (t.duty) dutyCounts[t.duty] = (dutyCounts[t.duty] || 0) + 1
    })

    const counts = Object.values(dutyCounts)
    const indicator = Object.keys(dutyCounts).map((duty) => {
      let name = duty.replace(/\*\*/g, '')
      name = name.replace(' ', '\n')
      return { name, max: Math.max(5, (counts.length ? Math.max(...counts) : 5) + 2) }
    })
    const values = counts
    while (values.length < indicator.length) values.push(3)

    chart.setOption({
      tooltip: {},
      radar: {
        indicator,
        name: { textStyle: { fontSize: 12.5, color: '#4a5568' } },
        splitArea: { areaStyle: { color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.1)'] } },
      },
      series: [
        {
          name: '能力模型',
          type: 'radar',
          data: [
            {
              value: values,
              name: jobName,
              itemStyle: { color: '#0c8a74' },
              lineStyle: { width: 2, color: '#0c8a74' },
              areaStyle: { color: 'rgba(12,138,116,0.3)' },
              symbol: 'circle',
              symbolSize: 5,
            },
          ],
        },
      ],
    })
  }, [job, jobName, chartRef])

  return <div ref={containerRef} className="ag-chart radar" />
}

// 核心职责与相关证书（课程）映射桑基图
const JobSankeyChart: React.FC<{ job: JobItem }> = ({ job }) => {
  const { containerRef, chartRef } = useChart()

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !job) return

    const links = job.sankeyLinks || []
    if (!links.length) return

    const dutyOrder = (name: string) => {
      const m = String(name || '').match(/^D(\d+)/)
      return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER
    }

    const leftDuties = Array.from(new Set(links.map((l) => l.source))).sort((a, b) => {
      const da = dutyOrder(a)
      const db = dutyOrder(b)
      if (da !== db) return da - db
      return String(a).localeCompare(String(b), 'zh-CN')
    })
    const rightTargets = Array.from(new Set(links.map((l) => l.target))).sort((a, b) =>
      String(a).localeCompare(String(b), 'zh-CN')
    )

    // 左右两列节点各自均匀纵向分布（上下对称、左右对称）
    // 左列职责标签置于节点左侧，右列证书标签置于节点右侧，保证文字完整显示
    const leftCount = leftDuties.length
    const rightCount = rightTargets.length
    const nodes = [
      ...leftDuties.map((name, i) => ({
        name,
        y: (i + 0.5) / leftCount,
        label: { position: 'left', fontSize: 11.5, color: '#2c3e50' },
      })),
      ...rightTargets.map((name, i) => ({
        name,
        y: (i + 0.5) / rightCount,
        label: { position: 'right', fontSize: 11.5, color: '#2c3e50' },
      })),
    ]

    const orderedLinks = [...links].sort((a, b) => {
      const da = dutyOrder(a.source)
      const db = dutyOrder(b.source)
      if (da !== db) return da - db
      const sc = String(a.source).localeCompare(String(b.source), 'zh-CN')
      if (sc !== 0) return sc
      return String(a.target).localeCompare(String(b.target), 'zh-CN')
    })

    chart.setOption({
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          sort: 'none',
          layoutIterations: 0,
          nodeAlign: 'justify',
          orient: 'horizontal',
          left: '20%',
          right: '26%',
          top: '4%',
          bottom: '4%',
          nodeWidth: 16,
          nodeGap: 8,
          emphasis: { focus: 'adjacency' },
          data: nodes,
          links: orderedLinks,
          lineStyle: { color: 'source', curveness: 0.5, opacity: 0.3 },
          label: { color: '#2c3e50', fontSize: 11.5 },
        },
      ],
    })
  }, [job, chartRef])

  if (!job?.sankeyLinks?.length) return <Empty description="暂无映射数据" />
  return <div ref={containerRef} className="ag-chart sankey" />
}

// ---------- 主页面 ----------
const AbilityGraph: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<JobCompetencyData | null>(null)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = (await positionApi.getJobCompetency()) as any
        const d = (res?.data || res) as JobCompetencyData
        if (mounted) {
          setData(d)
          // 默认选中“纺织设备维护工程师”（与参考站一致），否则取第一个
          const names = d.positionNames || []
          const preferred = names.includes('纺织设备维护工程师') ? '纺织设备维护工程师' : names[0]
          setSelected(preferred || '')
        }
      } catch (err) {
        console.error('岗位能力图谱加载失败:', err)
        if (mounted) setData(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const currentJob = useMemo(() => {
    if (!data || !selected) return null
    return data.positions[selected] || null
  }, [data, selected])

  if (loading) {
    return (
      <div className="module-page">
        <div className="ag-loading">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="module-page">
        <div className="page-header">
          <div className="page-title-row">
            <div className="page-icon">◆</div>
            <div>
              <h1>岗位能力图谱</h1>
              <p>典型岗位职业能力与课程映射图谱</p>
            </div>
          </div>
        </div>
        <div className="ag-empty">
          <Empty description="暂无岗位能力图谱数据" />
        </div>
      </div>
    )
  }

  const tasks = currentJob?.tasks || []
  const rows = tasks.map((task) => ({
    project: task.duty || '',
    task: `${task.id || ''} ${task.task || ''}`.trim(),
    skill: task.skill || '',
  }))

  // 计算合并行跨度（项目/任务/能力要求 三列各自合并）
  const cols = ['project', 'task', 'skill'] as const
  const spans: Record<string, number[]> = {}
  cols.forEach((col) => {
    spans[col] = Array(rows.length).fill(1)
    let i = 0
    while (i < rows.length) {
      const v = rows[i][col]
      if (!v) {
        i += 1
        continue
      }
      let j = i + 1
      while (j < rows.length && rows[j][col] === v) {
        j += 1
      }
      spans[col][i] = j - i
      for (let k = i + 1; k < j; k++) spans[col][k] = 0
      i = j
    }
  })

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="page-title-row">
          <div className="page-icon">◆</div>
          <div>
            <h1>岗位能力图谱</h1>
            <p>典型岗位职业能力与课程映射图谱（{data.positionNames.length} 个岗位，后续持续扩充）</p>
          </div>
        </div>
        <span className="module-tag">职业能力与课程映射</span>
      </div>

      {/* 岗位选择 */}
      <div className="ag-controls">
        <div className="ag-title">{selected || '请选择岗位'}</div>
        <Select
          value={selected}
          onChange={(v) => setSelected(v)}
          style={{ width: 260 }}
          placeholder="选择岗位"
          options={(data.positionNames || []).map((name) => ({ label: name, value: name }))}
        />
      </div>

      {!currentJob ? (
        <div className="ag-empty">
          <Empty description="暂无该岗位数据" />
        </div>
      ) : (
        <div className="ag-dashboard">
          {/* 上半部分：雷达图 + 桑基图 */}
          <div className="ag-top">
            <div className="ag-card">
              <div className="ag-card-title">岗位能力模型</div>
              <JobRadarChart job={currentJob} jobName={selected} />
            </div>
            <div className="ag-card wide">
              <div className="ag-card-title">核心职责与相关证书映射</div>
              <JobSankeyChart job={currentJob} />
            </div>
          </div>

          {/* 下半部分：典型工作任务分析 */}
          <div className="ag-card full">
            <div className="ag-card-title">典型工作任务分析</div>
            <div className="ag-table-scroll">
              <table className="ag-table">
                <thead>
                  <tr>
                    <th style={{ width: '14%' }}>项目</th>
                    <th style={{ width: '26%' }}>任务</th>
                    <th style={{ width: '60%' }}>能力要求</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? '' : 'alt'}>
                      {spans.project[idx] > 0 ? (
                        <td rowSpan={spans.project[idx]} className="ag-project">
                          {row.project}
                        </td>
                      ) : null}
                      {spans.task[idx] > 0 ? (
                        <td rowSpan={spans.task[idx]}>{row.task}</td>
                      ) : null}
                      {spans.skill[idx] > 0 ? (
                        <td rowSpan={spans.skill[idx]} className="ag-skill">
                          {row.skill}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AbilityGraph
