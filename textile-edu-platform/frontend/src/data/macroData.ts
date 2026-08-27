// ============================================
// 区域宏观经济数据结构定义
// 数据来源: dashboard.html 提取 (macro_data_import.json)
// 口径: 2025年度宏观数据
// ============================================

export interface MetricItem {
  label: string
  value: number | string
  unit?: string
  desc?: string
}

export interface InfoItem {
  label: string
  value: string
}

export interface MacroRegionData {
  id: 'city' | 'htz' | 'kfq'
  name: string
  shortName: string
  icon: string
  intro: string
  color: string
  // 首页展示的关键指标
  headline: MetricItem[]
  // 详情页
  overview: {
    title: string
    keyMetrics: MetricItem[]
    info?: InfoItem[]
    industries?: string[]
  }
  companies: MetricItem[]
  listingBreakdown?: MetricItem[]
  innovation: MetricItem[]
  patentBreakdown: { label: string; value: number; pct: number }[]
  financing: MetricItem[]
  reference: string[]
}

export const macroRegions: MacroRegionData[] = [
  // ============ 南通市 ============
  {
    id: 'city',
    name: '南通市宏观经济数据',
    shortName: '南通市',
    icon: '◉',
    intro:
      '南通市地处长江三角洲北翼，是江苏省纺织服装、高端装备制造重镇。2025年地区生产总值突破1.28万亿元，三次产业结构持续优化，拥有国家级高新区1个、国家级经开区4个，是产教融合的重要承载区。',
    color: '#1a8f7d',
    headline: [
      { label: '地区生产总值', value: 12801.5, unit: '亿元', desc: '2025年度' },
      { label: '企业总量', value: 394153, unit: '家' },
      { label: '上市企业', value: 58, unit: '家' },
      { label: '专利授权总量', value: 481855, unit: '件' },
    ],
    overview: {
      title: '宏观经济总览',
      keyMetrics: [
        { label: '地区生产总值', value: 12801.5, unit: '亿元', desc: '2025年度' },
        { label: '人均地区生产总值', value: 16.5, unit: '万元' },
        { label: '地方一般公共预算收入', value: 730, unit: '亿元' },
        { label: '地方一般公共预算支出', value: 1188.7, unit: '亿元' },
        { label: '社会消费品零售总额', value: 3855.4, unit: '亿元' },
        { label: '进出口总额', value: 615.9, unit: '亿美元' },
      ],
      info: [
        { label: '第一产业占比', value: '4.2%' },
        { label: '第二产业占比', value: '46.1%' },
        { label: '第三产业占比', value: '49.7%' },
        { label: '国家级经开区', value: '4个' },
        { label: '国家级高新区', value: '1个' },
      ],
    },
    companies: [
      { label: '企业总量', value: 394153, unit: '家' },
      { label: '专精特新企业', value: 1461, unit: '家' },
      { label: '国家级小巨人', value: 221, unit: '家' },
      { label: '省级专精特新', value: 1240, unit: '家' },
      { label: '国家高新技术企业', value: 5138, unit: '家' },
      { label: '上市企业', value: 58, unit: '家' },
      { label: '单项冠军', value: 31, unit: '家' },
      { label: '科技型中小企业', value: 7267, unit: '家' },
    ],
    listingBreakdown: [
      { label: '上交所', value: 18, unit: '家' },
      { label: '深交所', value: 28, unit: '家' },
      { label: '北交所', value: 9, unit: '家' },
      { label: '港交所', value: 3, unit: '家' },
    ],
    innovation: [
      { label: '创新平台', value: 31, unit: '个' },
      { label: '国家平台', value: 28, unit: '个' },
      { label: '软件著作权申请', value: 49608, unit: '件' },
      { label: '专利授权总量', value: 481855, unit: '件' },
      { label: '参研标准', value: 4870, unit: '项' },
      { label: '国家标准', value: 1335, unit: '项' },
    ],
    patentBreakdown: [
      { label: '发明专利', value: 58343, pct: 12.1 },
      { label: '实用新型', value: 228273, pct: 47.4 },
      { label: '外观设计', value: 195239, pct: 40.5 },
    ],
    financing: [
      { label: '融资项目', value: 2354, unit: '个' },
      { label: '融资金额', value: 2172.4, unit: '亿元' },
      { label: '参投机构', value: 1938, unit: '家' },
      { label: '获投企业', value: 1230, unit: '家' },
    ],
    reference: [
      '宏观年度数据为2025年口径，来源于南通市国民经济和社会发展统计公报',
      '企业数据来源于南通市市场监督管理局登记数据库',
      '专利数据来源于国家知识产权局专利检索与分析系统',
      '融资数据来源于公开融资事件数据库汇总',
    ],
  },

  // ============ 国家级高新区 ============
  {
    id: 'htz',
    name: '南通市国家级高新区宏观经济数据',
    shortName: '国家级高新区',
    icon: '◆',
    intro:
      '南通高新区2013年获批国家级高新区，规划面积1365平方公里。以通用设备、交通运输设备、纺织服装为主导产业，是南通纺织产业创新策源地和产教融合重点合作园区。',
    color: '#0c8a74',
    headline: [
      { label: '园区面积', value: 1365, unit: 'km²' },
      { label: '企业总量', value: 166416, unit: '家' },
      { label: '国家高新技术企业', value: 1897, unit: '家' },
      { label: '专利授权总量', value: 181776, unit: '件' },
    ],
    overview: {
      title: '园区总览',
      keyMetrics: [
        { label: '获批时间', value: '2013年12月', unit: '' },
        { label: '园区面积', value: 1365, unit: 'km²' },
        { label: '企业总量', value: 166416, unit: '家' },
        { label: '上市企业', value: 29, unit: '家' },
        { label: '国家高新技术企业', value: 1897, unit: '家' },
        { label: '专精特新企业', value: 530, unit: '家' },
      ],
      info: [
        { label: '主导产业', value: '通用设备、交通运输设备、纺织服装' },
        { label: '纺织工业企业', value: '17131家' },
        { label: '纺织产业链覆盖', value: '62/87环节（71.3%）' },
        { label: '园区纺织企业占全国', value: '1.4%' },
      ],
      industries: ['通用设备', '交通运输设备', '纺织服装'],
    },
    companies: [
      { label: '企业总量', value: 166416, unit: '家' },
      { label: '专精特新企业', value: 530, unit: '家' },
      { label: '国家级小巨人', value: 91, unit: '家' },
      { label: '省级专精特新', value: 439, unit: '家' },
      { label: '国家高新技术企业', value: 1897, unit: '家' },
      { label: '上市企业', value: 29, unit: '家' },
      { label: '单项冠军', value: 9, unit: '家' },
      { label: '科技型中小企业', value: 2721, unit: '家' },
    ],
    innovation: [
      { label: '创新平台', value: 19, unit: '个' },
      { label: '国家平台', value: 17, unit: '个' },
      { label: '软件著作权申请', value: 31997, unit: '件' },
      { label: '专利授权总量', value: 181776, unit: '件' },
      { label: '参研标准', value: 2016, unit: '项' },
      { label: '国家标准', value: 517, unit: '项' },
    ],
    patentBreakdown: [
      { label: '发明专利', value: 26825, pct: 14.8 },
      { label: '实用新型', value: 89265, pct: 49.1 },
      { label: '外观设计', value: 65686, pct: 36.1 },
    ],
    financing: [
      { label: '融资项目', value: 1122, unit: '个' },
      { label: '融资金额', value: 943.3, unit: '亿元' },
      { label: '参投机构', value: 1119, unit: '家' },
      { label: '获投企业', value: 561, unit: '家' },
    ],
    reference: [
      '获批时间与园区面积来源于科技部火炬中心国家级高新区名单',
      '主导产业与园区定位来源于南通高新区发展规划',
      '企业、专利、融资数据来源于各官方统计数据库',
      '纺织产业链覆盖度基于87个产业环节全国口径测算',
    ],
  },

  // ============ 国家级经开区 ============
  {
    id: 'kfq',
    name: '南通市国家级经开区宏观经济数据',
    shortName: '国家级经开区',
    icon: '◎',
    intro:
      '南通经济技术开发区1984年12月经国务院批准设立，是南通最早的国家级园区，规划面积31.2平方公里。以医药健康、电子信息、精密机械为主导产业，产业基础雄厚、创新要素集聚。',
    color: '#1a6d8a',
    headline: [
      { label: '获批时间', value: '1984年12月' },
      { label: '园区面积', value: 31.2, unit: 'km²' },
      { label: '企业总量', value: 23981, unit: '家' },
      { label: '国家高新技术企业', value: 493, unit: '家' },
    ],
    overview: {
      title: '园区总览',
      keyMetrics: [
        { label: '获批时间', value: '1984年12月' },
        { label: '园区面积', value: 31.2, unit: 'km²' },
        { label: '企业总量', value: 23981, unit: '家' },
        { label: '上市企业', value: 7, unit: '家' },
        { label: '国家高新技术企业', value: 493, unit: '家' },
        { label: '专精特新企业', value: 155, unit: '家' },
      ],
      info: [
        { label: '主导产业', value: '医药健康、电子信息、精密机械' },
        { label: '创新平台', value: '4个（国家2个、省级2个）' },
        { label: '产业载体', value: '专业产业园集聚区' },
      ],
      industries: ['医药健康', '电子信息', '精密机械'],
    },
    companies: [
      { label: '企业总量', value: 23981, unit: '家' },
      { label: '专精特新企业', value: 155, unit: '家' },
      { label: '国家级小巨人', value: 35, unit: '家' },
      { label: '省级专精特新', value: 120, unit: '家' },
      { label: '国家高新技术企业', value: 493, unit: '家' },
      { label: '上市企业', value: 7, unit: '家' },
      { label: '单项冠军', value: 4, unit: '家' },
      { label: '科技型中小企业', value: 603, unit: '家' },
    ],
    innovation: [
      { label: '创新平台', value: 4, unit: '个' },
      { label: '国家平台', value: 2, unit: '个' },
      { label: '软件著作权申请', value: 8829, unit: '件' },
      { label: '专利授权总量', value: 23996, unit: '件' },
      { label: '参研标准', value: 742, unit: '项' },
      { label: '国家标准', value: 214, unit: '项' },
    ],
    patentBreakdown: [
      { label: '发明专利', value: 3836, pct: 16.0 },
      { label: '实用新型', value: 12101, pct: 50.4 },
      { label: '外观设计', value: 8059, pct: 33.6 },
    ],
    financing: [
      { label: '融资项目', value: 345, unit: '个' },
      { label: '融资金额', value: 273.8, unit: '亿元' },
      { label: '参投机构', value: 407, unit: '家' },
      { label: '获投企业', value: 170, unit: '家' },
    ],
    reference: [
      '获批时间来源于商务部国家级经济技术开发区名单',
      '园区面积与主导产业来源于南通经济技术开发区管委会',
      '企业、专利、融资数据来源于各官方统计数据库',
      '创新平台数据来源于省市级创新载体认定名单',
    ],
  },
]

export const getRegionById = (id: string) =>
  macroRegions.find((r) => r.id === id)
