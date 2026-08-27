import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import './PlanningDashboard.css'

// ── 规划数据（来自三份十五五规划纲要） ──────────────────────────
const PLANNING_DATA = {
  state: {
    name: '国家十五五发展规划',
    textilePolicy: [
      '扩大轻工、纺织等优质产品供给',
      '高性能纤维及复合材料纳入高端新材料重点领域',
      '推进纺织等行业燃煤锅炉和工业窑炉清洁化替代',
      '推动技术改造升级，发展智能制造、绿色制造',
    ],
    goals: [
      { label: 'GDP总量目标', value: '140+', unit: '万亿元' },
      { label: '研发投入强度', value: '≥3.2', unit: '%' },
      { label: '规上工业研发机构', value: '80+', unit: '%' },
      { label: '数字经济占比', value: '50+', unit: '%' },
    ],
    textilePriority: '国家战略层面，纺织作为轻工支柱产业，重点在高性能纤维材料和绿色低碳转型',
  },
  jiangsu: {
    name: '江苏省十五五发展规划',
    textilePolicy: [
      '推动工程机械、纺织服装、船舶海工等抢占高附加值环节',
      '苏锡通高端纺织集群纳入14个国家先进制造业集群',
      '联合打造长三角高端纺织产业集群',
      '深入实施纺织等重点行业节能降碳改造行动',
      '先进功能纤维国家制造业创新中心建设质效提升',
    ],
    goals: [
      { label: 'GDP增速目标', value: '5.0', unit: '%' },
      { label: '制造业增加值', value: '45+', unit: '%' },
      { label: '高新技术产业产值占比', value: '50+', unit: '%' },
      { label: '可再生能源装机', value: '12000', unit: '万千瓦' },
    ],
    textilePriority: '江苏将纺织服装列为支柱产业焕新重点，苏锡通高端纺织集群为核心抓手',
  },
  nantong: {
    name: '南通市十五五发展规划',
    textilePolicy: [
      '深入实施传统产业焕新工程，纺织产业重点突破',
      '苏锡通高端纺织集群纳入国家先进制造业集群培育',
      '纺织行业节能降碳改造，推广绿色印染技术',
      '推进高性能纤维、功能性面料、产业用纺织品创新',
      '建设纺织产业园区数字化绿色化改造项目',
    ],
    goals: [
      { label: 'GDP增速目标', value: '5.5', unit: '%' },
      { label: '涉海产业规模', value: '10000', unit: '亿元' },
      { label: '进出口总值', value: '4000', unit: '亿元' },
      { label: '高新技术企业数', value: '翻倍', unit: '' },
    ],
    textilePriority: '南通纺织产业聚焦"苏锡通高端纺织"集群，向功能性面料、智能纺织、绿色印染升级',
  },
}

// ── 纺织产业链数据 ───────────────────────────────────────────────
const TEXTILE_CHAIN_DATA = {
  categories: ['纤维原料', '纺纱织造', '印染整理', '面料研发', '服装制造', '家纺产业', '产业用纺织品'],
  nationalOutput: [100, 85, 70, 60, 75, 65, 50],
  jiangsuOutput: [95, 92, 88, 85, 80, 90, 72],
  nantongOutput: [80, 75, 65, 70, 55, 85, 45],
}

// ── 产业发展趋势数据 ─────────────────────────────────────────────
const INDUSTRY_TREND = {
  years: ['2020', '2021', '2022', '2023', '2024', '2025E'],
  national: [42500, 44800, 46200, 47500, 49000, 51000],
  jiangsu: [12800, 13500, 13900, 14200, 14600, 15200],
  nantong: [1850, 1980, 2100, 2250, 2400, 2600],
}

// ── 政策关键词词频 ───────────────────────────────────────────────
const POLICY_KEYWORDS = [
  { keyword: '数字化', count: 52, level: 'state' },
  { keyword: '智能化', count: 38, level: 'state' },
  { keyword: '绿色制造', count: 45, level: 'state' },
  { keyword: '集群', count: 63, level: 'state' },
  { keyword: '产业链', count: 56, level: 'state' },
  { keyword: '纺织', count: 24, level: 'nantong' },
  { keyword: '新材料', count: 48, level: 'nantong' },
  { keyword: '智能制造', count: 19, level: 'nantong' },
  { keyword: '高性能纤维', count: 6, level: 'jiangsu' },
  { keyword: '节能降碳', count: 15, level: 'jiangsu' },
]

// ── 产业集群数据 ─────────────────────────────────────────────────
const CLUSTER_DATA = {
  labels: ['苏锡通高端纺织', '常熟服装集群', '吴江盛泽面料', '南通家纺集群', '张家港化纤', '常州功能面料'],
  values: [92, 88, 85, 90, 78, 72],
  targets: [95, 92, 90, 94, 85, 80],
}

// ── ECharts 初始化函数 ──────────────────────────────────────────

function useECharts(chartRef: React.RefObject<HTMLDivElement | null>, option: echarts.EChartsOption) {
  const chart = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (!chart.current) {
      chart.current = echarts.init(chartRef.current)
    }
    chart.current.setOption(option, true)
    return () => {}
  }, [option, chartRef])

  useEffect(() => {
    const handleResize = () => chart.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return chart.current
}

// ── 柱状图：纺织产业链各细分领域产值占比 ──────────────────────
function ChainBarChart() {
  const ref = useRef<HTMLDivElement>(null)
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['全国产值指数', '江苏产值指数', '南通产值指数'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: '3%', right: '4%', bottom: '18%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: TEXTILE_CHAIN_DATA.categories,
      axisLabel: { fontSize: 11, color: '#6b8180', rotate: 15 },
      axisLine: { lineStyle: { color: '#e3ebe9' } },
    },
    yAxis: {
      type: 'value',
      max: 120,
      axisLabel: { fontSize: 11, color: '#8fa8a6' },
      splitLine: { lineStyle: { color: '#f0f5f4', type: 'dashed' } },
    },
    series: [
      {
        name: '全国产值指数',
        type: 'bar',
        data: TEXTILE_CHAIN_DATA.nationalOutput,
        itemStyle: { color: '#b0bec5', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '江苏产值指数',
        type: 'bar',
        data: TEXTILE_CHAIN_DATA.jiangsuOutput,
        itemStyle: { color: '#4db6ac', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '南通产值指数',
        type: 'bar',
        data: TEXTILE_CHAIN_DATA.nantongOutput,
        itemStyle: { color: '#0c8a74', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }
  useECharts(ref, option)
  return <div ref={ref} className="echarts-chart" style={{ height: 260 }} />
}

// ── 折线图：纺织产业产值趋势 ────────────────────────────────────
function TrendLineChart() {
  const ref = useRef<HTMLDivElement>(null)
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['全国纺织业产值', '江苏纺织业产值', '南通纺织业产值'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: '3%', right: '4%', bottom: '16%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: INDUSTRY_TREND.years,
      axisLabel: { fontSize: 11, color: '#6b8180' },
      axisLine: { lineStyle: { color: '#e3ebe9' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: '#8fa8a6', formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}万亿` : `${v}亿` },
      splitLine: { lineStyle: { color: '#f0f5f4', type: 'dashed' } },
    },
    series: [
      {
        name: '全国纺织业产值',
        type: 'line',
        data: INDUSTRY_TREND.national,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#78909c', width: 2 },
        itemStyle: { color: '#78909c' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(120,144,156,0.15)' }, { offset: 1, color: 'rgba(120,144,156,0)' }] } },
      },
      {
        name: '江苏纺织业产值',
        type: 'line',
        data: INDUSTRY_TREND.jiangsu,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#4db6ac', width: 2 },
        itemStyle: { color: '#4db6ac' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(77,182,172,0.15)' }, { offset: 1, color: 'rgba(77,182,172,0)' }] } },
      },
      {
        name: '南通纺织业产值',
        type: 'line',
        data: INDUSTRY_TREND.nantong,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: { color: '#0c8a74', width: 2.5 },
        itemStyle: { color: '#0c8a74', borderColor: '#fff', borderWidth: 2 },
      },
    ],
  }
  useECharts(ref, option)
  return <div ref={ref} className="echarts-chart" style={{ height: 260 }} />
}

// ── 雷达图：产业集群发展评分 ────────────────────────────────────
function ClusterRadarChart() {
  const ref = useRef<HTMLDivElement>(null)
  const option: echarts.EChartsOption = {
    tooltip: {},
    legend: { data: ['当前水平', '十五五目标'], bottom: 0, textStyle: { fontSize: 11 } },
    radar: {
      indicator: CLUSTER_DATA.labels.map((l) => ({ name: l, max: 100 })),
      center: ['50%', '45%'],
      radius: '60%',
      axisName: { fontSize: 11, color: '#6b8180' },
      splitArea: { areaStyle: { color: ['rgba(12,138,116,0.02)', 'rgba(12,138,116,0.05)'] } },
      axisLine: { lineStyle: { color: '#e3ebe9' } },
      splitLine: { lineStyle: { color: '#e3ebe9' } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: CLUSTER_DATA.values,
          name: '当前水平',
          lineStyle: { color: '#4db6ac', width: 2 },
          itemStyle: { color: '#4db6ac' },
          areaStyle: { color: 'rgba(77,182,172,0.15)' },
        },
        {
          value: CLUSTER_DATA.targets,
          name: '十五五目标',
          lineStyle: { color: '#0c8a74', width: 2, type: 'dashed' },
          itemStyle: { color: '#0c8a74' },
          areaStyle: { color: 'rgba(12,138,116,0.1)' },
        },
      ],
    }],
  }
  useECharts(ref, option)
  return <div ref={ref} className="echarts-chart" style={{ height: 280 }} />
}

// ── 饼图：政策关键词分布 ─────────────────────────────────────────
function KeywordPieChart() {
  const ref = useRef<HTMLDivElement>(null)
  const pieData = POLICY_KEYWORDS.map((k) => ({
    name: `${k.keyword}`,
    value: k.count,
  }))
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}次 ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 11, color: '#6b8180' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: pieData,
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.1)' },
      },
    }],
    color: ['#0c8a74', '#4db6ac', '#26a69a', '#80cbc4', '#b2dfdb', '#00897b', '#00796b', '#4db6ac', '#78909c', '#546e7a'],
  }
  useECharts(ref, option)
  return <div ref={ref} className="echarts-chart" style={{ height: 240 }} />
}

// ── 规划卡片组件 ─────────────────────────────────────────────────
function PlanningCard({
  title, badge, color, policies, goals, priority,
}: {
  title: string; badge: string; color: string;
  policies: string[]; goals: { label: string; value: string; unit: string }[];
  priority: string;
}) {
  return (
    <div className="plan-card" style={{ borderColor: `${color}30` }}>
      <div className="plan-card-header" style={{ borderTopColor: color }}>
        <span className="plan-card-title">{title}</span>
        <span className="plan-card-badge">{badge}</span>
      </div>
      <div className="plan-card-body">
        <div className="plan-goals">
          {goals.map((g, i) => (
            <div className="plan-goal-item" key={i}>
              <span className="plan-goal-value">{g.value}<em>{g.unit}</em></span>
              <span className="plan-goal-label">{g.label}</span>
            </div>
          ))}
        </div>
        <div className="plan-policies">
          <h4>核心政策要点</h4>
          <ul>
            {policies.map((p, i) => (
              <li key={i}><span className="policy-dot" style={{ background: color }} />{p}</li>
            ))}
          </ul>
        </div>
        <div className="plan-priority">
          <h4>纺织产业定位</h4>
          <p>{priority}</p>
        </div>
      </div>
    </div>
  )
}

// ── 主组件 ───────────────────────────────────────────────────────
const PlanningBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'policy' | 'textile'>('overview')

  return (
    <div className="planning-page">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">◈</span>
          <div>
            <h1>产业发展规划看板</h1>
            <p>国家·省·市三级十五五规划纲要 · 纺织产业专题数据看板</p>
          </div>
        </div>
        <span className="module-tag">2026-2030</span>
      </div>

      {/*  Tab 切换 */}
      <div className="planning-tabs">
        {(['overview', 'policy', 'textile'] as const).map((tab) => (
          <button
            key={tab}
            className={`planning-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 总体概览'}
            {tab === 'policy' && '📋 政策要点'}
            {tab === 'textile' && '🧵 纺织产业'}
          </button>
        ))}
      </div>

      {/* ── 总体概览 ── */}
      {activeTab === 'overview' && (
        <>
          {/* KPI 卡片 */}
          <div className="planning-kpi-row">
            {[
              { label: '国家GDP目标', value: '140+', unit: '万亿元', icon: '🇨🇳', color: '#c62828' },
              { label: '江苏GDP增速', value: '5.0', unit: '%', icon: '📈', color: '#1565c0' },
              { label: '南通GDP增速', value: '5.5', unit: '%', icon: '🏙️', color: '#2e7d32' },
              { label: '涉海产业规模', value: '1万亿+', unit: '元', icon: '🌊', color: '#00838f' },
              { label: '进出口总值', value: '4000+', unit: '亿元', icon: '🚢', color: '#6a1b9a' },
              { label: '高新技术企业', value: '59', unit: '家上市', icon: '🏭', color: '#e65100' },
            ].map((kpi, i) => (
              <div className="kpi-card" key={i} style={{ borderTopColor: kpi.color }}>
                <span className="kpi-icon">{kpi.icon}</span>
                <div className="kpi-content">
                  <span className="kpi-value">{kpi.value}<em>{kpi.unit}</em></span>
                  <span className="kpi-label">{kpi.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 图表行 */}
          <div className="planning-chart-row">
            <div className="chart-card">
              <h3>📊 纺织产业链各细分领域产值指数</h3>
              <ChainBarChart />
            </div>
            <div className="chart-card">
              <h3>📈 纺织产业产值发展趋势（2020-2025E）</h3>
              <TrendLineChart />
            </div>
          </div>

          {/* 三大规划卡片 */}
          <div className="planning-cards-row">
            <PlanningCard
              title="国家十五五发展规划"
              badge="国家级"
              color="#c62828"
              policies={PLANNING_DATA.state.textilePolicy}
              goals={PLANNING_DATA.state.goals}
              priority={PLANNING_DATA.state.textilePriority}
            />
            <PlanningCard
              title="江苏省十五五发展规划"
              badge="省级"
              color="#1565c0"
              policies={PLANNING_DATA.jiangsu.textilePolicy}
              goals={PLANNING_DATA.jiangsu.goals}
              priority={PLANNING_DATA.jiangsu.textilePriority}
            />
            <PlanningCard
              title="南通市十五五发展规划"
              badge="市级"
              color="#2e7d32"
              policies={PLANNING_DATA.nantong.textilePolicy}
              goals={PLANNING_DATA.nantong.goals}
              priority={PLANNING_DATA.nantong.textilePriority}
            />
          </div>
        </>
      )}

      {/* ── 政策要点 ── */}
      {activeTab === 'policy' && (
        <>
          <div className="planning-chart-row">
            <div className="chart-card">
              <h3>📋 政策关键词频次分析</h3>
              <KeywordPieChart />
            </div>
            <div className="chart-card">
              <h3>🎯 产业集群发展水平 vs 十五五目标</h3>
              <ClusterRadarChart />
            </div>
          </div>
          <div className="policy-table-wrap">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>层级</th>
                  <th>关键词</th>
                  <th>提及次数</th>
                  <th>纺织关联度</th>
                  <th>核心内容</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { level: '国家', kw: '纺织', count: 2, relevance: '中', detail: '扩大优质产品供给，推进清洁化替代' },
                  { level: '国家', kw: '高性能纤维', count: 1, relevance: '高', detail: '纳入高端新材料专栏，重点突破' },
                  { level: '江苏', kw: '纺织服装', count: 4, relevance: '高', detail: '支柱产业焕新，抢占高附加值环节' },
                  { level: '江苏', kw: '苏锡通高端纺织', count: 1, relevance: '高', detail: '14个国家先进制造业集群之一' },
                  { level: '江苏', kw: '长三角高端纺织集群', count: 1, relevance: '高', detail: '联合打造长三角高端纺织产业集群' },
                  { level: '江苏', kw: '先进功能纤维', count: 1, relevance: '高', detail: '国家制造业创新中心建设' },
                  { level: '南通', kw: '纺织', count: 24, relevance: '极高', detail: '传统产业焕新重点，集群化绿色发展' },
                  { level: '南通', kw: '新材料', count: 48, relevance: '高', detail: '高性能纤维、功能性面料重点方向' },
                  { level: '南通', kw: '智能制造', count: 15, relevance: '中', detail: '纺织企业数字化改造重点' },
                  { level: '南通', kw: '节能降碳', count: 2, relevance: '高', detail: '纺织行业重点节能降碳改造' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td><span className={`level-badge ${row.level === '国家' ? 'state' : row.level === '江苏' ? 'js' : 'nt'}`}>{row.level}</span></td>
                    <td className="kw-cell">{row.kw}</td>
                    <td>{row.count}</td>
                    <td><span className={`relevance-${row.relevance}`}>{row.relevance}</span></td>
                    <td className="detail-cell">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── 纺织产业专题 ── */}
      {activeTab === 'textile' && (
        <>
          <div className="planning-chart-row">
            <div className="chart-card wide">
              <h3>🧵 纺织产业链全景与区域产值对比</h3>
              <ChainBarChart />
            </div>
            <div className="chart-card">
              <h3>🎯 产业集群发展雷达</h3>
              <ClusterRadarChart />
            </div>
          </div>
          <div className="planning-chart-row">
            <div className="chart-card wide">
              <h3>📈 纺织产业产值发展趋势（2020-2025E）</h3>
              <TrendLineChart />
            </div>
            <div className="chart-card">
              <h3>📋 政策关键词分布</h3>
              <KeywordPieChart />
            </div>
          </div>

          {/* 南通纺织产业重点方向 */}
          <div className="textile-focus">
            <h3>南通市纺织产业十五五重点发展方向</h3>
            <div className="focus-grid">
              {[
                { title: '苏锡通高端纺织集群', desc: '国家先进制造业集群，聚焦高性能纤维、功能性面料、产业用纺织品', tag: '集群', tagColor: '#0c8a74' },
                { title: '功能性面料创新', desc: '开发防水透气、抗菌防臭、智能调温等功能性面料，提升产品附加值', tag: '创新', tagColor: '#1565c0' },
                { title: '绿色印染转型', desc: '推广数码印花、无水染色、余热回收等绿色印染技术，实现节能减排', tag: '绿色', tagColor: '#2e7d32' },
                { title: '智能制造升级', desc: '推进纺织企业数字化改造，建设智能纺纱、织造、检测生产线', tag: '智能', tagColor: '#6a1b9a' },
                { title: '产业用纺织品', desc: '发展医疗防护、土工建筑、汽车内饰等高附加值产业用纺织品', tag: '新兴', tagColor: '#e65100' },
                { title: '家纺产业升级', desc: '推动南通家纺从传统制造向设计驱动、品牌引领转型', tag: '品牌', tagColor: '#00838f' },
              ].map((item, i) => (
                <div className="focus-card" key={i}>
                  <div className="focus-tag" style={{ background: item.tagColor + '18', color: item.tagColor, borderColor: item.tagColor + '40' }}>
                    {item.tag}
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PlanningBoard
