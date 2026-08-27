import React, { useEffect, useRef, useState } from 'react'
import { Empty, Spin } from 'antd'
import * as echarts from 'echarts'
import { industryChainApi } from '../../services/api'
import '../../components/common/ModulePlaceholder.css'
import './TechAnalysis.css'

// ---------- 类型 ----------
interface SankeyLink {
  source: string
  target: string
  value: number
  strength?: string
}

interface MajorMappingItem {
  major_name: string
  importance_weight: number
  related_techs: string[]
  is_covered: boolean
}

interface OverviewData {
  school_info?: {
    name?: string
    majors?: string[]
  }
  nantong_hot_techs?: Record<string, number>
  sankey_links?: SankeyLink[]
  major_mapping_analysis?: MajorMappingItem[]
}

interface OverviewReport {
  schoolName: string
  data: OverviewData
}

// ---------- 子组件：热度 TOP15 ----------
const HotTechChart: React.FC<{ hotTechs: Record<string, number> }> = ({ hotTechs }) => {
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

    const entries = Object.entries(hotTechs || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .reverse()
    const names = entries.map((e) => e[0])
    const values = entries.map((e) => e[1])

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: { left: '4%', right: '10%', top: '6%', bottom: '4%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 12 },
        splitLine: { lineStyle: { color: 'rgba(15,44,89,0.08)' } },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: '#334155', fontSize: 12.5, width: 150, overflow: 'truncate' },
        axisLine: { lineStyle: { color: 'rgba(15,44,89,0.12)' } },
      },
      series: [
        {
          name: '专利量',
          type: 'bar',
          data: values,
          barMaxWidth: 18,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#2a75d3' },
              { offset: 1, color: '#0f2c59' },
            ]),
            borderRadius: [0, 6, 6, 0],
          },
          label: { show: true, position: 'right', color: '#0f2c59', fontSize: 12 },
        },
      ],
    })
  }, [hotTechs])

  if (!Object.keys(hotTechs || {}).length) return <Empty description="暂无热度数据" />
  return <div ref={containerRef} className="ov-chart-box" />
}

// ---------- 子组件：桑基传导映射 ----------
const SankeyChart: React.FC<{
  hotTechs: Record<string, number>
  links: SankeyLink[]
  schoolMajors: string[]
}> = ({ hotTechs, links, schoolMajors }) => {
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

    const validTechs = Object.keys(hotTechs || {}).filter((k) => (hotTechs[k] || 0) > 50)
    const filteredLinks = (links || []).filter((l) => validTechs.includes(l.source))

    const nodesMap = new Map<string, string>()
    filteredLinks.forEach((link) => {
      if (!nodesMap.has(link.source)) nodesMap.set(link.source, 'Tech')
      if (!nodesMap.has(link.target)) nodesMap.set(link.target, 'Major')
    })

    const majorsSet = new Set(schoolMajors || [])
    const nodesData = Array.from(nodesMap.entries()).map(([name, category]) => {
      let color = '#94a3b8'
      let borderColor = '#ffffff'
      if (category === 'Tech') {
        color = '#e85d04'
      } else {
        color = majorsSet.has(name) ? '#2a75d3' : '#cbd5e1'
        borderColor = majorsSet.has(name) ? '#0f2c59' : '#ffffff'
      }
      return { name, itemStyle: { color, borderColor, borderWidth: 1 } }
    })

    chart.setOption({
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: { focus: 'adjacency' },
          nodeAlign: 'justify',
          data: nodesData,
          links: filteredLinks,
          lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.25 },
          label: { color: '#2c3e50', fontSize: 12 },
        },
      ],
    })
  }, [hotTechs, links, schoolMajors])

  if (!links?.length) return <Empty description="暂无传导映射数据" />
  return <div ref={containerRef} className="ov-chart-box tall" />
}

// ---------- 子组件：综合匹配度雷达 ----------
const CoverageChart: React.FC<{ majors: MajorMappingItem[] }> = ({ majors }) => {
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

    const sorted = (majors || []).slice().sort((a, b) => b.importance_weight - a.importance_weight)
    const top = sorted.slice(0, 8)
    const maxV = (top[0]?.importance_weight || 0) + 100
    const indicator = top.map((m) => ({ name: m.major_name, max: maxV }))
    const requiredData = top.map((m) => m.importance_weight || 0)
    const coveredData = top.map((m) => (m.is_covered ? m.importance_weight || 0 : 0))

    chart.setOption({
      tooltip: {},
      legend: { data: ['产业需求热度', '学校覆盖情况'], bottom: 0, textStyle: { color: '#64748b' } },
      radar: {
        indicator,
        shape: 'circle',
        splitNumber: 4,
        axisName: { color: '#334155', fontSize: 12 },
        splitLine: { lineStyle: { color: ['rgba(15,44,89,0.08)'] } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: 'rgba(15,44,89,0.12)' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: requiredData,
              name: '产业需求热度',
              itemStyle: { color: '#e85d04' },
              areaStyle: { color: 'rgba(232,93,4,0.12)' },
              lineStyle: { type: 'dashed' },
            },
            {
              value: coveredData,
              name: '学校覆盖情况',
              itemStyle: { color: '#2a75d3' },
              areaStyle: { color: 'rgba(42,117,211,0.22)' },
            },
          ],
        },
      ],
    })
  }, [majors])

  if (!majors?.length) return <Empty description="暂无匹配度数据" />
  return <div ref={containerRef} className="ov-chart-box" />
}

// ---------- 主页面 ----------
const TechAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<OverviewReport | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = (await industryChainApi.getTechOverview()) as any
        if (mounted) setReport((res?.data || res) as OverviewReport)
      } catch (err) {
        console.error('技术前沿总览加载失败:', err)
        if (mounted) setReport(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="module-page">
        <div className="tf-loading">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="module-page">
        <div className="page-header">
          <div className="page-title-row">
            <div className="page-icon">✦</div>
            <div>
              <h1>行业前沿技术分析</h1>
              <p>南通纺织行业技术热点与专业传导映射分析</p>
            </div>
          </div>
        </div>
        <div className="tf-empty">
          <Empty description="暂无技术前沿分析数据" />
        </div>
      </div>
    )
  }

  const d = report.data
  const hotTechs = d.nantong_hot_techs || {}
  const majors = d.major_mapping_analysis || []
  const links = d.sankey_links || []
  const schoolMajors = d.school_info?.majors || []
  const schoolName = d.school_info?.name || report.schoolName

  // 结构性缺口 / 需升级课程的专业
  const sorted = majors.slice().sort((a, b) => b.importance_weight - a.importance_weight)
  const gapItems: string[] = []
  const upgradeItems: string[] = []
  let gapCount = 0
  let upgradeCount = 0
  sorted.forEach((m) => {
    const related = (m.related_techs || []).slice(0, 3).join('、')
    if (!m.is_covered && gapCount < 5) {
      gapItems.push(related ? `${m.major_name}（关联热点：${related}）` : m.major_name)
      gapCount++
      return
    }
    if (m.is_covered && upgradeCount < 5) {
      upgradeItems.push(related ? `${m.major_name}（建议升级模块：${related}）` : m.major_name)
      upgradeCount++
    }
  })
  if (gapCount === 0) gapItems.push('核心产业需求已完全覆盖')

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="page-title-row">
          <div className="page-icon">✦</div>
          <div>
            <h1>行业前沿技术分析</h1>
            <p>总览 · 南通纺织产业链 ⟷ {schoolName}</p>
          </div>
        </div>
        <span className="module-tag">技术前沿总览</span>
      </div>

      {/* 面板 1：南通纺织技术主题热度 TOP15 */}
      <div className="tf-panel">
        <div className="tf-panel-head">
          <span className="section-index">01</span>
          <h3>南通纺织技术主题热度 TOP15（按专利量）</h3>
        </div>
        <HotTechChart hotTechs={hotTechs} />
      </div>

      {/* 面板 2：技术需求向专业的传导映射 */}
      <div className="tf-panel">
        <div className="tf-panel-head">
          <span className="section-index">02</span>
          <h3>技术需求向专业的传导映射</h3>
        </div>
        <SankeyChart hotTechs={hotTechs} links={links} schoolMajors={schoolMajors} />
      </div>

      {/* 面板 3：综合匹配度评估与建议 */}
      <div className="tf-panel">
        <div className="tf-panel-head">
          <span className="section-index">03</span>
          <h3>综合匹配度评估与建议</h3>
        </div>
        <div className="tf-panel-split">
          <div className="ov-chart-side">
            <CoverageChart majors={majors} />
          </div>
          <div className="tf-lists">
            <div className="tf-list-card">
              <div className="tf-list-title">需关注的结构性缺口</div>
              <ul className="tf-list">
                {gapItems.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="tf-list-card">
              <div className="tf-list-title">需升级核心课程的专业</div>
              <ul className="tf-list">
                {upgradeItems.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechAnalysis
