import React, { useEffect, useRef, useState } from 'react'
import { Empty, Spin } from 'antd'
import * as echarts from 'echarts'
import { positionApi } from '../../services/api'
import '../../components/common/ModulePlaceholder.css'
import './MarketAnalysis.css'

// ---------- 类型 ----------
interface AnalysisJob {
  name: string
  cat: string
  heat: number
  salary: number
  gap: '是' | '否'
  edu: string
  cap: string
  chain: string
}

interface OccMajorLink {
  source: string
  target: string
  value: number
  majorType: string
}

interface OccMajorTableRow {
  occ_name: string
  occ_code: string
  jobs: string[]
  majors: string[]
  major_types: string[]
  total_majors: number
}

interface AnalysisData {
  jobs: AnalysisJob[]
  occMajorNodes: { name: string }[]
  occMajorLinks: OccMajorLink[]
  occMajorTable: OccMajorTableRow[]
}

const CAT_COLORS: Record<string, string> = {
  工艺岗位: '#2a75d3',
  技术岗位: '#e85d04',
  设备岗位: '#38a169',
  销售岗位: '#805ad5',
  管理岗位: '#d69e2e',
}

const EDU_COLORS: Record<string, string> = {
  不限: '#a0aec0',
  大专: '#2a75d3',
  本科: '#e85d04',
  硕士: '#805ad5',
}

// ---------- 图表组件基类 ----------
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

// 1. 岗位类别分布（饼图）
const CatPie: React.FC<{ jobs: AnalysisJob[] }> = ({ jobs }) => {
  const { containerRef, chartRef } = useChart()
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !jobs.length) return
    const catCount: Record<string, number> = {}
    jobs.forEach((j) => {
      catCount[j.cat] = (catCount[j.cat] || 0) + 1
    })
    const pieData = Object.entries(catCount).map(([name, value]) => ({
      name,
      value,
      itemStyle: { color: CAT_COLORS[name] || '#718096' },
    }))
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      legend: { bottom: 10 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          label: { formatter: '{b}\n{d}%', fontSize: 12 },
          data: pieData,
          emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.15)' } },
        },
      ],
    })
  }, [jobs, chartRef])
  return <div ref={containerRef} className="ma-chart" />
}

// 2. 需求热度 TOP10（横向柱状图）
const HeatBar: React.FC<{ jobs: AnalysisJob[] }> = ({ jobs }) => {
  const { containerRef, chartRef } = useChart()
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !jobs.length) return
    const sorted = [...jobs].sort((a, b) => b.heat - a.heat).slice(0, 10).reverse()
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '35%', right: '10%', top: '5%', bottom: '8%' },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: sorted.map((j) => j.name), axisLabel: { fontSize: 12 } },
      series: [
        {
          type: 'bar',
          data: sorted.map((j) => ({ value: j.heat, itemStyle: { color: CAT_COLORS[j.cat] || '#718096' } })),
          barWidth: 18,
          label: { show: true, position: 'right', fontSize: 12 },
        },
      ],
    })
  }, [jobs, chartRef])
  return <div ref={containerRef} className="ma-chart" />
}

// 3. 各岗位类别平均薪资（柱状图）
const SalaryBar: React.FC<{ jobs: AnalysisJob[] }> = ({ jobs }) => {
  const { containerRef, chartRef } = useChart()
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !jobs.length) return
    const catSalary: Record<string, number> = {}
    const catCount: Record<string, number> = {}
    jobs.forEach((j) => {
      catSalary[j.cat] = (catSalary[j.cat] || 0) + j.salary
      catCount[j.cat] = (catCount[j.cat] || 0) + 1
    })
    const salaryBars = Object.keys(catSalary)
      .map((cat) => ({ name: cat, avg: Math.round(catSalary[cat] / catCount[cat]) }))
      .sort((a, b) => b.avg - a.avg)
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (p: any) => `${p[0]?.name}<br/>平均月薪: ¥${Number(p[0]?.value).toLocaleString()}`,
      },
      grid: { left: '12%', right: '10%', top: '12%', bottom: '12%' },
      xAxis: {
        type: 'category',
        data: salaryBars.map((s) => s.name),
        axisLabel: { fontSize: 12.5, rotate: 12 },
      },
      yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `¥${v.toLocaleString()}` } },
      series: [
        {
          type: 'bar',
          data: salaryBars.map((s) => ({ value: s.avg, itemStyle: { color: CAT_COLORS[s.name] || '#718096' } })),
          barWidth: 40,
          label: { show: true, position: 'top', formatter: (v: any) => `¥${Number(v.value).toLocaleString()}`, fontSize: 12 },
        },
      ],
    })
  }, [jobs, chartRef])
  return <div ref={containerRef} className="ma-chart" />
}

// 4. 学历要求分布（饼图）
const EduPie: React.FC<{ jobs: AnalysisJob[] }> = ({ jobs }) => {
  const { containerRef, chartRef } = useChart()
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !jobs.length) return
    const eduCount: Record<string, number> = {}
    jobs.forEach((j) => {
      let edu = j.edu || '不限'
      if (edu === '学历不限') edu = '不限'
      eduCount[edu] = (eduCount[edu] || 0) + 1
    })
    const pieData = Object.entries(eduCount).map(([name, value]) => ({
      name,
      value,
      itemStyle: { color: EDU_COLORS[name] || '#38a169' },
    }))
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      legend: { bottom: 10 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          label: { formatter: '{b}\n{d}%', fontSize: 12 },
          data: pieData,
          emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.15)' } },
        },
      ],
    })
  }, [jobs, chartRef])
  return <div ref={containerRef} className="ma-chart" />
}

// ---------- 主页面 ----------
const MarketAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalysisData | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = (await positionApi.getPositionAnalysis()) as any
        if (mounted) setData((res?.data || res) as AnalysisData)
      } catch (err) {
        console.error('关键岗位能力分析加载失败:', err)
        if (mounted) setData(null)
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
        <div className="ma-loading">
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
            <div className="page-icon">◈</div>
            <div>
              <h1>市场岗位需求分析</h1>
              <p>南通纺织服装产业市场岗位需求数据可视化</p>
            </div>
          </div>
        </div>
        <div className="ma-empty">
          <Empty description="暂无岗位分析数据" />
        </div>
      </div>
    )
  }

  const jobs = data.jobs || []
  const allowedMajorTypes = new Set(['高职专科专业', '职业本科专业'])
  const isAllowed = (majorType: string) => Array.from(allowedMajorTypes).some((t) => (majorType || '').includes(t))
  const filteredOccMajorLinks = (data.occMajorLinks || []).filter((l) => isAllowed(l.majorType))

  // 职业-专业对照明细表
  const majorsByOcc: Record<string, string[]> = {}
  filteredOccMajorLinks.forEach((l) => {
    if (!majorsByOcc[l.source]) majorsByOcc[l.source] = []
    if (!majorsByOcc[l.source].includes(l.target)) majorsByOcc[l.source].push(l.target)
  })
  const tableRows = (data.occMajorTable || []).filter((row) => (majorsByOcc[row.occ_name] || []).length > 0)

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="page-title-row">
          <div className="page-icon">◈</div>
          <div>
            <h1>市场岗位需求分析</h1>
            <p>南通纺织服装产业关键岗位能力与人才需求分析（{jobs.length} 个关键岗位）</p>
          </div>
        </div>
        <span className="module-tag">关键岗位能力分析</span>
      </div>

      {/* 1-4：四图网格 */}
      <div className="ma-grid4">
        <div className="ma-card">
          <div className="ma-card-title">岗位类别分布</div>
          <CatPie jobs={jobs} />
        </div>
        <div className="ma-card">
          <div className="ma-card-title">需求热度 TOP10 岗位</div>
          <HeatBar jobs={jobs} />
        </div>
        <div className="ma-card">
          <div className="ma-card-title">各岗位类别平均薪资对比</div>
          <SalaryBar jobs={jobs} />
        </div>
        <div className="ma-card">
          <div className="ma-card-title">学历要求分布</div>
          <EduPie jobs={jobs} />
        </div>
      </div>

      {/* 5：职业—专业对照明细表 */}
      <div className="ma-card full">
        <div className="ma-card-title">职业—专业对照明细表</div>
        <div className="ma-table-scroll">
          <table className="ma-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>国家职业标准名称</th>
                <th style={{ width: '12%' }}>职业代码</th>
                <th style={{ width: '20%' }}>对应关键岗位</th>
                <th style={{ width: '36%' }}>对应专业（学校培养方向）</th>
                <th style={{ width: '12%' }}>专业总数</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const allowedMajors = majorsByOcc[row.occ_name] || []
                return (
                  <tr key={row.occ_name}>
                    <td className="ma-occ-name">{row.occ_name}</td>
                    <td>{row.occ_code}</td>
                    <td>{(row.jobs || []).join('、')}</td>
                    <td>
                      {allowedMajors.slice(0, 8).map((m) => (
                        <span className="ma-major-tag" key={m}>
                          {m}
                        </span>
                      ))}
                      {allowedMajors.length > 8 ? <span className="ma-more">等{allowedMajors.length}个专业</span> : null}
                    </td>
                    <td className="ma-occ-count">{allowedMajors.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MarketAnalysis
