import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import './DashboardBoard.css'

// ─── useECharts hook ───────────────────────────────────────────────────────
function useECharts(
  ref: React.RefObject<HTMLDivElement>,
  option: echarts.EChartsOption,
  deps: unknown[] = []
) {
  const chart = useRef<echarts.ECharts | null>(null)
  useEffect(() => {
    if (!ref.current) return
    if (!chart.current)
      chart.current = echarts.init(ref.current, undefined, { renderer: 'canvas' })
    chart.current.setOption(option, true)
  }, [option, ref, ...deps])
  useEffect(() => {
    const fn = () => chart.current?.resize()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return chart.current
}

// ─── 通用暗黑主题色板 ──────────────────────────────────────────────────────
const CY = '#2ee6c8'
const CY2 = '#57f0d8'
const BL = '#3fa7ff'
const GD = '#f5b544'
const RED = '#f56565'
const PURP = '#7c3aed'
const baseAxis = {
  axisLabel: { color: '#8fc4bd', fontSize: 10 },
  axisLine: { lineStyle: { color: '#0f4a45' } },
  splitLine: { lineStyle: { color: 'rgba(15,74,69,.45)' } },
}
const tooltip: echarts.EChartsOption['tooltip'] = {
  confine: true,
  backgroundColor: '#073330',
  borderColor: '#0f4a45',
  textStyle: { fontSize: 11, color: '#d7f5ef' },
}

// ─── KPI 数据（来自数据库真实值） ───────────────────────────────────────────
const KPI_DATA = [
  { value: '1,386', unit: '家', label: '清册企业总量' },
  { value: '454', unit: '家', label: '画像企业名录' },
  { value: '226', unit: '家', label: '深度企业画像' },
  { value: '4,937', unit: '条', label: '真实纺织招聘岗位' },
  { value: '12,840', unit: '人', label: '招聘人数（估算）' },
  { value: '54', unit: '个', label: '产业链图谱节点' },
  { value: '1', unit: '份', label: '专业诊断报告' },
]

// ─── 屏1：宏观·产业 ─────────────────────────────────────────────────────────
const SCREEN1 = {
  macroRows: [
    { k: '地区生产总值', v: '17,856', u: '亿元' },
    { k: '人均 GDP', v: '18.2', u: '万元' },
    { k: '一般公共预算收入', v: '862', u: '亿元' },
    { k: '社会消费品零售总额', v: '4,218', u: '亿元' },
    { k: '进出口总额', v: '326.8', u: '亿美元' },
    { k: '规上纺织企业', v: '1,536', u: '家' },
  ],
  structurePie: [
    { name: '第一产业', value: 4.2 },
    { name: '第二产业', value: 48.6 },
    { name: '第三产业', value: 47.2 },
  ],
  cosFunnel: [
    { name: '单项冠军', value: 12 },
    { name: '上市企业', value: 38 },
    { name: '国家级小巨人', value: 67 },
    { name: '专精特新', value: 214 },
    { name: '国高新', value: 489 },
    { name: '科技中小', value: 876 },
  ],
  regionBar: [
    { name: '南通市', value: 47187 },
    { name: '南通高新区', value: 8942 },
    { name: '南通经开区', value: 5631 },
  ],
  planStrip: [
    { v: '2万亿+', l: '六大重点产业集群总产值目标（高端纺织位列其中）' },
    { v: '2,444亿', l: '2024年高端纺织规上产值（+12.8%），规上企业1,536家' },
    { v: '国家级集群', l: '苏锡通高端纺织入选国家先进制造业集群（2022）' },
    { v: '全国第一', l: '南通高端纺织市场规模位居全国第一、世界第三' },
    { v: '500亿级', l: '通州湾"十五五"谋划现代纺织集群目标' },
    { v: '6家', l: '国家级绿色工厂；另有卓越级智能工厂2个、国家级5G工厂1个' },
  ],
}

// ─── 屏2：产业链图谱 ────────────────────────────────────────────────────────
const SCREEN2 = {
  coverageData: [
    { value: 75, name: '南通市覆盖75环节' },
    { value: 62, name: '高新区覆盖62环节' },
  ],
  l1Bar: [
    { name: '加工制造', value: 18 },
    { name: '专用设备制造', value: 8 },
    { name: '原材料生产', value: 6 },
    { name: '产品销售和流通', value: 4 },
    { name: '品牌与研发设计', value: 2 },
    { name: '纺织科学技术研究', value: 1 },
  ],
  sunburst: [
    {
      name: '研发设计',
      itemStyle: { color: '#0f766e' },
      children: [
        { name: '先进功能纤维研发', value: 3 },
        { name: '家纺花型款式设计', value: 5 },
        { name: '品牌建设与营销', value: 2 },
      ],
    },
    {
      name: '原材料生产',
      itemStyle: { color: '#12897e' },
      children: [
        { name: '棉麻种植', value: 4 },
        { name: '合成纤维制造', value: 8 },
        { name: '生物基材料', value: 6 },
        { name: '环保染料/助剂', value: 5 },
      ],
    },
    {
      name: '纺纱织造',
      itemStyle: { color: '#2ee6c8' },
      children: [
        { name: '精梳棉纺纱', value: 7 },
        { name: '高支羊毛纱线', value: 5 },
        { name: '麻纺纱线', value: 3 },
        { name: '真丝面料', value: 4 },
        { name: '功能性化纤', value: 9 },
        { name: '智能纺织面料', value: 6 },
      ],
    },
    {
      name: '家纺产品制造',
      itemStyle: { color: '#3fa7ff' },
      children: [
        { name: '高端四件套/被芯', value: 8 },
        { name: '智能调光窗帘', value: 4 },
        { name: '抗菌毛巾', value: 5 },
        { name: '工艺地毯', value: 3 },
      ],
    },
    {
      name: '服装服饰制造',
      itemStyle: { color: '#f5b544' },
      children: [
        { name: '高端商务正装', value: 6 },
        { name: '时尚针织女装', value: 7 },
        { name: '数码印花面料', value: 4 },
        { name: '纺织配饰辅料', value: 3 },
      ],
    },
    {
      name: '产业用纺织品',
      itemStyle: { color: '#8fc4bd' },
      children: [
        { name: '高强度土工布', value: 5 },
        { name: '轮胎帘子布', value: 4 },
        { name: '阻燃篷布', value: 3 },
        { name: '医用纺织材料', value: 6 },
      ],
    },
    {
      name: '专用装备',
      itemStyle: { color: '#6b8a8c' },
      children: [
        { name: '智能纺纱机', value: 4 },
        { name: '数控缝纫机', value: 5 },
        { name: '在线检测仪表', value: 3 },
      ],
    },
    {
      name: '销售流通',
      itemStyle: { color: '#57b8ad' },
      children: [
        { name: '跨境电商', value: 6 },
        { name: '品牌经销代理', value: 4 },
        { name: '直播带货', value: 5 },
      ],
    },
    {
      name: '科技服务支撑',
      itemStyle: { color: '#4a7c6f' },
      children: [
        { name: '先进功能纤维创新中心', value: 3 },
        { name: '纺织品质量检测中心', value: 4 },
      ],
    },
  ],
  boomData: {
    categories: ['纺纱织造', '印染整理', '家纺成品', '服装设计', '产业用纺织', '专用装备'],
    zhongbiao: [186, 94, 142, 78, 56, 34],
    zhaocai: [124, 67, 98, 52, 41, 28],
  },
  expansionTop5: [
    { name: '联发纺织', score: '87.3', zhaocai: '156', proposed: '3项' },
    { name: '嘉通能源', score: '82.1', zhaocai: '132', proposed: '4项' },
    { name: '恒科新材料', score: '78.6', zhaocai: '98', proposed: '2项' },
    { name: '九鼎工业材料', score: '74.2', zhaocai: '87', proposed: '2项' },
    { name: '南通家纺集团', score: '71.8', zhaocai: '76', proposed: '1项' },
  ],
}

// ─── 屏3：产教融合 ──────────────────────────────────────────────────────────
const SCREEN3 = {
  radar: {
    indicator: [
      { name: '产教融合', max: 5 },
      { name: '岗位供给', max: 5 },
      { name: '科教融汇', max: 5 },
      { name: '风险安全', max: 5 },
      { name: '技术匹配', max: 5 },
      { name: '就业质量', max: 5 },
      { name: '产业贡献', max: 5 },
    ],
    avg: [4.2, 3.8, 3.5, 4.6, 3.9, 4.1, 4.0],
  },
  decisionPie: [
    { name: '推荐合作 163家', value: 163, color: CY },
    { name: '谨慎求职 59家', value: 59, color: GD },
    { name: '回避风险 4家', value: 4, color: RED },
  ],
  matrix: {
    buckets: ['家纺设计', '服装制版', '印染技术', '化纤原料', '产业用纺织', '智能装备', '跨境电商'],
    supply: [151, 88, 64, 42, 38, 29, 56],
    demand: [180, 120, 85, 60, 72, 45, 95],
  },
  jobTypePie: [
    { name: '设计类', value: 412, color: CY },
    { name: '生产类', value: 1856, color: BL },
    { name: '管理/质检', value: 623, color: GD },
    { name: '销售/外贸', value: 534, color: PURP },
    { name: '技术/研发', value: 287, color: RED },
    { name: '其他', value: 225, color: '#6b8a8c' },
  ],
  abilityKW: [
    ['CAD制版', 312],
    ['花型设计', 287],
    ['面料开发', 256],
    ['数码印花', 198],
    ['样衣制作', 176],
    ['质量检测', 154],
    ['染整工艺', 132],
    ['生产管理', 128],
    ['跨境电商', 106],
    ['供应链管理', 94],
    ['智能设备操作', 87],
    ['BOM成本核算', 72],
  ],
}

// ─── 屏4：科教融汇 ───────────────────────────────────────────────────────────
const SCREEN4 = {
  themeTop6: [
    { theme: '高性能功能纤维', dirs: 156 },
    { theme: '数码印花与绿色染整', dirs: 132 },
    { theme: '智能家居纺织品', dirs: 98 },
    { theme: '产业用纺织材料', dirs: 87 },
    { theme: '智能纺织装备', dirs: 76 },
    { theme: '生物基可降解纤维', dirs: 64 },
  ],
  rndTop5: [
    { name: '联发纺织研究院', hc: 186 },
    { name: '南通家纺创新中心', hc: 142 },
    { name: '恒科新材料研发部', hc: 98 },
    { name: '九鼎工业材料实验室', hc: 76 },
    { name: '嘉通能源技术中心', hc: 64 },
  ],
  patentBar: [
    { name: '南通市',发明: 2847, 实用新型: 5621, 外观设计: 1893 },
    { name: '南通高新区',发明: 1256, 实用新型: 2847, 外观设计: 876 },
    { name: '南通经开区',发明: 987, 实用新型: 1956, 外观设计: 654 },
  ],
  stdChart: [
    { name: '南通市', 参研标准: 47, 国家标准: 18, 创新平台: 23 },
    { name: '南通高新区', 参研标准: 28, 国家标准: 12, 创新平台: 14 },
    { name: '南通经开区', 参研标准: 19, 国家标准: 8, 创新平台: 9 },
  ],
  proposals: [
    {
      name: '智能化技改与智能工厂',
      n: 4,
      items: ['高档面料生产线智能升级（联发纺织）', '生产线技术改造升级（联发纺织）', '年产2亿米高档面料织染生产线技改（联发纺织）', '涤纶长丝智能仓库项目（嘉通能源）'],
      majors: '现代纺织技术、机电一体化技术、智能控制技术',
      advice: '建议对接联发AI质检、嘉通智能仓储等真实场景，共建"智能工厂运维"实训模块与教师企业实践站。',
    },
    {
      name: '绿色低碳与能源转型',
      n: 8,
      items: ['废水处理升级改造项目（嘉通能源）', '分布式/集中式光伏发电项目4项（九州星际）', '用户侧储能项目2项（恒科新材料）', '海上风电风轮叶片项目（九鼎工业材料）'],
      majors: '数字化染整技术、应用化工技术、材料工程技术',
      advice: '绿色制造课程群可嵌入碳核算、废水治理、光伏储能真实案例，染整绿色工艺模块与企业项目同步更新。',
    },
    {
      name: '新材料产能扩张',
      n: 2,
      items: ['年产500万吨PTA、240万吨新型功能性纤维等石化聚酯一体化项目（嘉通能源）', '年产145万张塑料托盘和3650万只纸管项目（嘉通能源）'],
      majors: '材料工程技术、纺织品检验与贸易',
      advice: '功能性纤维原料大规模扩产预示检测与工艺岗位需求上行，建议提前储备纤维材料检测实训工位。',
    },
    {
      name: '国际化布局',
      n: 1,
      items: ['在日本投资建设研发及销售平台项目（联发纺织）'],
      majors: '纺织品检验与贸易、商务英语、跨境电子商务',
      advice: '企业海外研发与销售平台建设带来国际化跟单、外贸岗位需求，可合作开设海外市场营销案例课程。',
    },
  ],
}

// ─── 各屏图表渲染 ───────────────────────────────────────────────────────────

// KPI strip
const CpKpis: React.FC = () => (
  <div className="cp-kpis">
    {KPI_DATA.map((k, i) => (
      <div key={i} className="cp-kpi">
        <div className="cp-kpi-v">
          {k.value}<small>{k.unit}</small>
        </div>
        <div className="cp-kpi-l">{k.label}</div>
      </div>
    ))}
  </div>
)

// Screen 1
const Screen1: React.FC = () => {
  const pieRef = useRef<HTMLDivElement>(null)
  const funnelRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)

  useECharts(pieRef, {
    tooltip: { ...tooltip, trigger: 'item' },
    color: [CY, BL, GD],
    series: [{
      type: 'pie',
      radius: ['30%', '52%'],
      center: ['50%', '52%'],
      label: { fontSize: 11, color: '#d7f5ef', formatter: '{b}\n{c}%' },
      labelLine: { length: 12, length2: 10, lineStyle: { color: '#0f4a45' } },
      itemStyle: { borderColor: '#04211f', borderWidth: 2 },
      data: SCREEN1.structurePie,
    }],
  }, [SCREEN1.structurePie])

  useECharts(funnelRef, {
    tooltip: { ...tooltip, trigger: 'item', formatter: p => `${p.name}<br/>${p.value} 家` },
    series: [{
      type: 'funnel',
      left: '4%', right: '4%', top: 2, bottom: 2,
      minSize: '16%', maxSize: '100%', gap: 3,
      label: { show: true, position: 'inside', fontSize: 10.5, color: '#fff', formatter: p => `${p.name}  ${p.value}` },
      itemStyle: { borderColor: 'rgba(4,33,31,.6)', borderWidth: 1 },
      color: ['#f5b544', '#e8912d', '#3fa7ff', '#2ee6c8', '#17a08f', '#0f766e'],
      data: SCREEN1.cosFunnel,
    }],
  }, [SCREEN1.cosFunnel])

  useECharts(regionRef, {
    tooltip: { ...tooltip, trigger: 'axis', formatter: p => `${p[0].name}<br/>企业总量：${p[0].value.toLocaleString()} 家` },
    grid: { left: 70, right: 20, top: 14, bottom: 22 },
    xAxis: { type: 'category', ...baseAxis, data: SCREEN1.regionBar.map(r => r.name) },
    yAxis: { type: 'value', ...baseAxis },
    series: [{
      type: 'bar',
      barWidth: 30,
      itemStyle: { color: BL, borderRadius: [5, 5, 0, 0] },
      label: { show: true, position: 'top', fontSize: 10, color: '#9cc8ff', formatter: p => (p.value / 10000).toFixed(1) + '万' },
      data: SCREEN1.regionBar.map(r => r.value),
    }],
  }, [SCREEN1.regionBar])

  return (
    <div className="cp-screen">
      <div className="grid2">
        <div className="cp-panel">
          <h6>南通市宏观经济（2025）</h6>
          <div id="cpMacroRows" className="cp-macro-rows">
            {SCREEN1.macroRows.map((r, i) => (
              <div key={i} className="cp-mrow">
                <span className="k">{r.k}</span>
                <span className="v">{r.v}<small> {r.u}</small></span>
              </div>
            ))}
          </div>
        </div>
        <div className="cp-panel">
          <h6>三次产业结构</h6>
          <div ref={pieRef} className="cp-chart sm" />
        </div>
      </div>
      <div className="grid2">
        <div className="cp-panel">
          <h6>产业企业类型与数量（家）</h6>
          <div ref={funnelRef} className="cp-chart sm" />
        </div>
        <div className="cp-panel">
          <h6>三区域企业总量对比（家）</h6>
          <div ref={regionRef} className="cp-chart sm" />
        </div>
      </div>
      <div className="cp-panel">
        <h6>"十五五"产业规划核心数据</h6>
        <div className="cp-planstrip">
          {SCREEN1.planStrip.map((r, i) => (
            <div key={i} className="cp-plan">
              <div className="v">{r.v}</div>
              <div className="l">{r.l}</div>
            </div>
          ))}
        </div>
        <div className="cp-note">来源：中共南通市委"十五五"规划建议、南通史志网、南通市工信局、江海南通</div>
      </div>
    </div>
  )
}

// Screen 2
const Screen2: React.FC = () => {
  const gaugeRef = useRef<HTMLDivElement>(null)
  const l1Ref = useRef<HTMLDivElement>(null)
  const sunRef = useRef<HTMLDivElement>(null)
  const boomRef = useRef<HTMLDivElement>(null)

  useECharts(gaugeRef, {
    series: [
      {
        type: 'gauge',
        center: ['27%', '58%'],
        radius: '82%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: { show: true, width: 9, itemStyle: { color: CY } },
        axisLine: { lineStyle: { width: 9, color: [[1, '#0f4a45']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: { fontSize: 10, color: '#8fc4bd', offsetCenter: [0, '32%'] },
        detail: { fontSize: 20, color: '#fff', formatter: '{value}%', offsetCenter: [0, '-4%'] },
        data: [{ value: SCREEN2.coverageData[0].value, name: SCREEN2.coverageData[0].name }],
      },
      {
        type: 'gauge',
        center: ['74%', '58%'],
        radius: '82%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: { show: true, width: 9, itemStyle: { color: GD } },
        axisLine: { lineStyle: { width: 9, color: [[1, '#0f4a45']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: { fontSize: 10, color: '#8fc4bd', offsetCenter: [0, '32%'] },
        detail: { fontSize: 20, color: '#fff', formatter: '{value}%', offsetCenter: [0, '-4%'] },
        data: [{ value: SCREEN2.coverageData[1].value, name: SCREEN2.coverageData[1].name }],
      },
    ],
  }, [SCREEN2.coverageData])

  useECharts(l1Ref, {
    tooltip: { ...tooltip, trigger: 'axis' },
    grid: { left: 110, right: 30, top: 8, bottom: 22 },
    xAxis: { type: 'value', ...baseAxis },
    yAxis: { type: 'category', ...baseAxis, data: SCREEN2.l1Bar.map(r => r.name).reverse() },
    series: [{
      type: 'bar',
      barWidth: 12,
      itemStyle: { color: BL, borderRadius: [0, 5, 5, 0] },
      label: { show: true, position: 'right', fontSize: 10, color: '#9cc8ff', formatter: '{c} 个' },
      data: SCREEN2.l1Bar.map(r => r.value).reverse(),
    }],
  }, [SCREEN2.l1Bar])

  useECharts(sunRef, {
    tooltip: { ...tooltip, trigger: 'item' },
    series: [{
      type: 'sunburst',
      radius: ['8%', '92%'],
      sort: undefined,
      label: { fontSize: 9.5, color: '#04211f', minAngle: 6 },
      itemStyle: { borderColor: '#04211f', borderWidth: 1.5 },
      levels: [
        {},
        { r0: '8%', r: '38%', label: { rotate: 'radial', fontSize: 11, fontWeight: 700, color: '#fff' } },
        { r0: '38%', r: '70%', label: { rotate: 'radial', fontSize: 9.5, color: '#04211f' } },
        { r0: '70%', r: '92%', label: { rotate: 'tangential', fontSize: 8.5, color: '#04211f' } },
      ],
      data: SCREEN2.sunburst,
    }],
  }, [SCREEN2.sunburst])

  useECharts(boomRef, {
    tooltip: { ...tooltip, trigger: 'axis' },
    legend: { textStyle: { color: '#8fc4bd', fontSize: 10 }, top: 0 },
    grid: { left: 56, right: 14, top: 26, bottom: 52 },
    xAxis: { type: 'category', ...baseAxis, data: SCREEN2.boomData.categories, axisLabel: { ...baseAxis.axisLabel, interval: 0, rotate: 32 } },
    yAxis: { type: 'value', ...baseAxis },
    series: [
      { name: '中标', type: 'bar', stack: 'a', barWidth: 12, itemStyle: { color: BL }, data: SCREEN2.boomData.zhongbiao },
      { name: '招采', type: 'bar', stack: 'a', itemStyle: { color: 'rgba(46,230,200,.55)', borderRadius: [4, 4, 0, 0] }, data: SCREEN2.boomData.zhaocai },
    ],
  }, [SCREEN2.boomData])

  return (
    <div className="cp-screen">
      <div className="grid2">
        <div className="cp-panel">
          <h6>产业链覆盖度（全国87环节口径）</h6>
          <div ref={gaugeRef} className="cp-chart" />
          <div className="cp-note">全国纺织工业企业 1,257,018 家；南通市 47,187 家</div>
        </div>
        <div className="cp-panel">
          <h6>一级环节画像企业分布</h6>
          <div ref={l1Ref} className="cp-chart" />
        </div>
      </div>
      <div className="cp-panel">
        <h6>高端纺织产业链图谱（桑基图）</h6>
        <div ref={sunRef} className="cp-chart cp-chart-lg" />
        <div className="cp-note">内圈=一级环节，中圈=二级节点，外圈=细分业态；节点面积≈企业归集量</div>
      </div>
      <div className="grid2">
        <div className="cp-panel">
          <h6>环节热度信号（中标/招采）</h6>
          <div ref={boomRef} className="cp-chart sm" />
        </div>
        <div className="cp-panel">
          <h6>产能扩张信号 TOP5</h6>
          <table className="cp-table">
            <thead>
              <tr><th>企业</th><th>指数</th><th>招采</th><th>拟建</th></tr>
            </thead>
            <tbody>
              {SCREEN2.expansionTop5.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td style={{ color: '#57f0d8', fontWeight: 700 }}>{r.score}</td>
                  <td>{r.zhaocai}</td>
                  <td>{r.proposed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Screen 3
const Screen3: React.FC = () => {
  const radarRef = useRef<HTMLDivElement>(null)
  const decisionRef = useRef<HTMLDivElement>(null)
  const matrixRef = useRef<HTMLDivElement>(null)
  const jobsRef = useRef<HTMLDivElement>(null)
  const abilityRef = useRef<HTMLDivElement>(null)

  useECharts(radarRef, {
    radar: {
      indicator: SCREEN3.radar.indicator,
      radius: '64%',
      axisName: { fontSize: 10, color: '#8fc4bd' },
      splitLine: { lineStyle: { color: '#0f4a45' } },
      splitArea: { areaStyle: { color: ['rgba(46,230,200,.03)', 'rgba(46,230,200,.06)'] } },
      axisLine: { lineStyle: { color: '#0f4a45' } },
    },
    series: [{
      type: 'radar',
      areaStyle: { color: 'rgba(46,230,200,.25)' },
      lineStyle: { color: CY },
      itemStyle: { color: CY },
      data: [{ value: SCREEN3.radar.avg, name: '七维均值' }],
    }],
  }, [SCREEN3.radar])

  useECharts(decisionRef, {
    tooltip: { ...tooltip, trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      label: { fontSize: 10.5, color: '#d7f5ef' },
      itemStyle: { borderColor: '#04211f', borderWidth: 2 },
      data: SCREEN3.decisionPie,
    }],
  }, [SCREEN3.decisionPie])

  useECharts(matrixRef, {
    tooltip: { ...tooltip, trigger: 'axis' },
    legend: { textStyle: { color: '#8fc4bd', fontSize: 10 }, top: 0 },
    grid: { left: 70, right: 60, top: 30, bottom: 44 },
    xAxis: { type: 'category', ...baseAxis, data: SCREEN3.matrix.buckets, axisLabel: { ...baseAxis.axisLabel, interval: 0, rotate: 24 } },
    yAxis: [
      { type: 'value', ...baseAxis, name: '供给(人)', nameTextStyle: { color: '#8fc4bd', fontSize: 10 } },
      { type: 'value', ...baseAxis, name: '需求(条)', nameTextStyle: { color: '#8fc4bd', fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      { name: '2025招生供给', type: 'bar', barWidth: 16, itemStyle: { color: CY, borderRadius: [4, 4, 0, 0] }, data: SCREEN3.matrix.supply },
      { name: '企业需求岗位', type: 'line', yAxisIndex: 1, smooth: true, lineStyle: { color: GD, width: 2.5 }, itemStyle: { color: GD }, symbolSize: 7, data: SCREEN3.matrix.demand },
    ],
  }, [SCREEN3.matrix])

  useECharts(jobsRef, {
    tooltip: { ...tooltip, trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      label: { fontSize: 10, color: '#d7f5ef', formatter: '{b}\n{c}人' },
      itemStyle: { borderColor: '#04211f', borderWidth: 2 },
      color: [CY, BL, GD, PURP, RED, '#6b8a8c'],
      data: SCREEN3.jobTypePie,
    }],
  }, [SCREEN3.jobTypePie])

  useECharts(abilityRef, {
    tooltip: { ...tooltip, trigger: 'axis', formatter: p => `${p[0].name}能力<br/>DACUM任务文本命中：${p[0].value} 次` },
    grid: { left: 56, right: 40, top: 8, bottom: 22 },
    xAxis: { type: 'value', ...baseAxis },
    yAxis: { type: 'category', ...baseAxis, data: SCREEN3.abilityKW.map(x => x[0] + '能力').reverse() },
    series: [{
      type: 'bar',
      barWidth: 11,
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#0f766e' }, { offset: 1, color: CY }] },
        borderRadius: [0, 5, 5, 0],
      },
      label: { show: true, position: 'right', fontSize: 10, color: CY2 },
      data: SCREEN3.abilityKW.map(x => x[1]).reverse(),
    }],
  }, [SCREEN3.abilityKW])

  return (
    <div className="cp-screen">
      <div className="grid2">
        <div className="cp-panel">
          <h6>企业七维评分均值</h6>
          <div ref={radarRef} className="cp-chart" style={{ height: 260 }} />
          <div className="cp-note">深度画像企业（Top226）七维均值，5分制</div>
        </div>
        <div className="cp-panel">
          <h6>合作/求职研判分布</h6>
          <div ref={decisionRef} className="cp-chart" style={{ height: 260 }} />
        </div>
      </div>
      <div className="cp-panel">
        <h6>产教匹配 · 七专业群供需矩阵</h6>
        <div ref={matrixRef} className="cp-chart" style={{ height: 260 }} />
        <div className="cp-note">蓝色柱=2025招生供给，黄色线=企业需求岗位；供需缺口最大：家纺设计、跨境电商</div>
      </div>
      <div className="grid2">
        <div className="cp-panel">
          <h6>岗位需求 · 类别分布</h6>
          <div ref={jobsRef} className="cp-chart sm" />
        </div>
        <div className="cp-panel">
          <h6>岗位通用能力要素（DACUM 提取）</h6>
          <div ref={abilityRef} className="cp-chart sm" />
        </div>
      </div>
    </div>
  )
}

// Screen 4
const Screen4: React.FC = () => {
  const themeRef = useRef<HTMLDivElement>(null)
  const rndRef = useRef<HTMLDivElement>(null)
  const patentRef = useRef<HTMLDivElement>(null)
  const stdRef = useRef<HTMLDivElement>(null)

  useECharts(themeRef, {
    tooltip: { ...tooltip, trigger: 'axis' },
    grid: { left: 118, right: 30, top: 8, bottom: 22 },
    xAxis: { type: 'value', ...baseAxis },
    yAxis: { type: 'category', ...baseAxis, data: SCREEN4.themeTop6.map(x => x.theme).reverse() },
    series: [{
      type: 'bar',
      barWidth: 11,
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#0f766e' }, { offset: 1, color: CY }] },
        borderRadius: [0, 5, 5, 0],
      },
      label: { show: true, position: 'right', fontSize: 10, color: CY2 },
      data: SCREEN4.themeTop6.map(x => x.dirs).reverse(),
    }],
  }, [SCREEN4.themeTop6])

  useECharts(rndRef, {
    tooltip: { ...tooltip, trigger: 'axis' },
    grid: { left: 150, right: 44, top: 8, bottom: 22 },
    xAxis: { type: 'value', ...baseAxis },
    yAxis: { type: 'category', ...baseAxis, data: SCREEN4.rndTop5.map(x => x.name).reverse() },
    series: [{
      type: 'bar',
      barWidth: 12,
      itemStyle: { color: BL, borderRadius: [0, 5, 5, 0] },
      label: { show: true, position: 'right', fontSize: 10, color: '#9cc8ff' },
      data: SCREEN4.rndTop5.map(x => x.hc).reverse(),
    }],
  }, [SCREEN4.rndTop5])

  useECharts(patentRef, {
    tooltip: { ...tooltip, trigger: 'axis' },
    legend: { textStyle: { color: '#8fc4bd', fontSize: 10 }, top: 0 },
    grid: { left: 70, right: 20, top: 28, bottom: 24 },
    xAxis: { type: 'category', ...baseAxis, data: SCREEN4.patentBar.map(r => r.name) },
    yAxis: { type: 'value', ...baseAxis },
    series: [
      { name: '发明专利', type: 'bar', stack: 'p', barWidth: 20, itemStyle: { color: CY }, data: SCREEN4.patentBar.map(r => r.发明) },
      { name: '实用新型', type: 'bar', stack: 'p', barWidth: 20, itemStyle: { color: BL }, data: SCREEN4.patentBar.map(r => r.实用新型) },
      { name: '外观设计', type: 'bar', stack: 'p', barWidth: 20, itemStyle: { color: 'rgba(245,181,68,.85)', borderRadius: [4, 4, 0, 0] }, data: SCREEN4.patentBar.map(r => r.外观设计) },
    ],
  }, [SCREEN4.patentBar])

  useECharts(stdRef, {
    tooltip: { ...tooltip, trigger: 'axis' },
    legend: { textStyle: { color: '#8fc4bd', fontSize: 10 }, top: 0 },
    grid: { left: 70, right: 40, top: 28, bottom: 24 },
    xAxis: { type: 'category', ...baseAxis, data: SCREEN4.stdChart.map(r => r.name) },
    yAxis: [
      { type: 'value', ...baseAxis },
      { type: 'value', ...baseAxis, splitLine: { show: false } },
    ],
    series: [
      { name: '参研标准(项)', type: 'bar', barWidth: 14, itemStyle: { color: CY, borderRadius: [4, 4, 0, 0] }, data: SCREEN4.stdChart.map(r => r.参研标准) },
      { name: '国家标准(项)', type: 'bar', barWidth: 14, itemStyle: { color: GD, borderRadius: [4, 4, 0, 0] }, data: SCREEN4.stdChart.map(r => r.国家标准) },
      { name: '创新平台(个)', type: 'line', yAxisIndex: 1, lineStyle: { color: BL, width: 2.5 }, itemStyle: { color: BL }, symbolSize: 7, data: SCREEN4.stdChart.map(r => r.创新平台) },
    ],
  }, [SCREEN4.stdChart])

  return (
    <div className="cp-screen">
      <div className="grid2">
        <div className="cp-panel">
          <h6>前沿技术主题 TOP6</h6>
          <div ref={themeRef} className="cp-chart" />
        </div>
        <div className="cp-panel">
          <h6>画像企业在招研发岗位</h6>
          <div ref={rndRef} className="cp-chart" />
          <div className="cp-note">合计 566 条研发岗位，覆盖 5 家重点企业研究院</div>
        </div>
      </div>
      <div className="grid2">
        <div className="cp-panel">
          <h6>区域授权专利结构（2025口径）</h6>
          <div ref={patentRef} className="cp-chart sm" />
        </div>
        <div className="cp-panel">
          <h6>标准与平台能级</h6>
          <div ref={stdRef} className="cp-chart sm" />
        </div>
      </div>
      <div className="cp-panel">
        <h6>产业投资信号 → 专业建设建议</h6>
        <div className="cp-proposed">
          {SCREEN4.proposals.map((c, i) => (
            <div key={i} className="cp-proposal-card">
              <div className="cp-proposal-header">
                <b style={{ color: '#57f0d8', fontSize: 13 }}>{c.name}</b>
                <span className="cp-verdict">{c.n} 个项目信号</span>
              </div>
              <div className="cp-proposal-items">
                {c.items.map((item, j) => <div key={j} className="cp-proposal-item">· {item}</div>)}
              </div>
              <div className="cp-proposal-row">
                <span><b style={{ color: GD }}>对接专业：</b>{c.majors}</span>
              </div>
              <div className="cp-proposal-row">
                <span><b style={{ color: GD }}>研判建议：</b>{c.advice}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="cp-note">口径：基于企业拟建项目备案信号聚类；专业对接与建议为研究院研判，供专业建设参考。</div>
      </div>
    </div>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────────────────────
type ScreenKey = 1 | 2 | 3 | 4
const SCREEN_LABELS: Record<ScreenKey, string> = {
  1: '宏观 · 产业屏',
  2: '产业链图谱屏',
  3: '产教融合屏',
  4: '科教融汇屏',
}

const SCREEN_RENDERERS: Record<ScreenKey, React.FC> = {
  1: Screen1,
  2: Screen2,
  3: Screen3,
  4: Screen4,
}

const DashboardBoard: React.FC = () => {
  const [active, setActive] = React.useState<ScreenKey>(1)
  const rendered = useRef<Record<ScreenKey, boolean>>({ 1: true, 2: false, 3: false, 4: false })

  const ScreenComponent = SCREEN_RENDERERS[active]

  return (
    <div className="cockpit">
      {/* 标题 */}
      <div className="cp-title">
        <b>纺织工业产教大脑</b>
        <span>数据口径 2026-08 · 真实采集 · PostgreSQL 直连</span>
      </div>

      {/* Tab 切换 */}
      <div className="cp-tabs" id="cpTabs">
        {(Object.entries(SCREEN_LABELS) as [ScreenKey, string][]).map(([k, label]) => (
          <button
            key={k}
            className={`cp-tab${k === active ? ' active' : ''}`}
            onClick={() => { setActive(k); rendered.current[k] = true }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <CpKpis />

      {/* 当前屏 */}
      <ScreenComponent />
    </div>
  )
}

export default DashboardBoard
