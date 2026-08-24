import React, { useEffect, useRef, useState } from 'react'
import { Card, Tabs, Row, Col, List, Tag, Button, Table, Descriptions, Statistic, Modal, Spin, Empty, Input } from 'antd'
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { industryChainApi, industryEduAdaptationApi } from '../../services/api'
import './MajorReports.css'

interface AdaptationData {
  eduJobComparison: {
    majorInfo: any
    jobOverview: any
    workDomains: any[]
    jobCoverageMatrix: any[]
  }
  courseMatrix: {
    courses: any[]
    domainSummary: any[]
  }
  domainAnalysis: any[]
  overallAssessment: {
    score: number
    grade: string
    conclusion: string
    strengths: string[]
    weaknesses: string[]
    top3Adjustments: string[]
  }
  patentEnterpriseMatching: {
    ipcs: any[]
    topUniversities: any[]
    topEnterprises: any[]
  }
  topEnterprises: any[]
  techCourseMapping: {
    hotFields: any[]
    trainingProjects: string[]
  }
}

// 企业画像弹窗数据类型
interface SupplyProfile {
  school: string
  major: string
  group: string | null
  bucket: string | null
  tags: string[]
  supply25: number
}

interface ModalData {
  enterpriseId?: string
  name?: string
  error?: string
  category?: string
  area?: string
  rating?: number | null
  graphOnly?: boolean
  scores?: Record<string, number> | null
  analysis?: {
    brief?: string
    majors?: string[]
    eduView?: string
    jobView?: string
    riskFlags?: string[]
    decision?: string
    decisionReason?: string
  }
  qualsSrc?: string | null
  honors?: string[]
  demandBuckets?: string[]
  recruitment?: { total?: number; jobs?: any[] } | null
  insuredTrend?: { year?: number; count?: number }[]
  supplyProfiles?: SupplyProfile[]
  supplyTotal?: number
  webNotes?: string | null
}

// 雷达图子组件
const RadarChart: React.FC<{ scores: Record<string, number> | null }> = ({ scores }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    chartRef.current ||= echarts.init(containerRef.current, undefined, { renderer: 'canvas' })
    return () => { chartRef.current?.dispose(); chartRef.current = null }
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
      series: [{
        type: 'radar',
        data: [{
          value: values, name: '能力评分',
          areaStyle: { color: 'rgba(12,138,116,0.22)' },
          lineStyle: { color: '#0c8a74', width: 2 },
          itemStyle: { color: '#0c8a74' },
        }],
      }],
    })
  }, [scores])

  return <div ref={containerRef} className="radar-box" />
}

const DIM_ORDER = ['产教融合合作价值', '科教融汇潜力', '岗位供给与匹配', '就业质量', '企业稳定性', '风险安全度', '成长性']

const DECISION_META: Record<string, { label: string; cls: string }> = {
  推荐: { label: '推荐', cls: 'g' },
  谨慎: { label: '谨慎', cls: 'a' },
  回避: { label: '回避', cls: 'r' },
}
const decisionMeta = (d: string) => DECISION_META[d] || { label: d || '谨慎', cls: 'a' }

// 专业诊断报告
const MajorReports: React.FC = () => {
  const majors = [
    '现代纺织技术',
    '机电与自动化',
    '染色与化工',
    '服装家纺与设计',
    '电子与信息',
    '商贸与流通',
    '检验检测与质量',
  ]

  const years = ['2026年度', '2027年度', '2028年度']

  // 诊断报告在线预览状态（key = `${major}-${year}`）
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null)

  // 诊断报告 HTML 路径映射
  const REPORT_PATHS: Record<string, string> = {
    '现代纺织技术-2026年度': '/reports/现代纺织专业设置诊断报告.html',
  }

  // 访企拓岗企业名单（源自 网站/index.html 现代纺织技术 strongCos）
  const visitCompanies: Record<string, string[]> = {
    '现代纺织技术': [
      '金秋弹性织物（海安）有限公司', '南通旺而盛纺织有限公司', '南通帝人有限公司', '南通泰利达化工有限公司',
      '江苏泰慕士针纺科技股份有限公司', '南通澜禾非织造材料有限公司', '乔德（南通）纺织品有限公司',
      '金瑜昌纺织科技南通有限公司', '南通好瑞吉家用纺织品有限公司', '江苏弘盛新材料（集团）股份有限公司',
      '江苏联发纺织股份有限公司', '南通倍佳机械科技有限公司', '江苏新世嘉家纺高新科技股份有限公司',
      '南通金驰机电有限公司', '南通驰舟纺织科技有限公司', '江苏丽洋新材料股份有限公司',
      '江苏嘉通能源有限公司', '江苏恒辉安防集团股份有限公司', '南通福恩新材料有限公司',
      '海安市联发制衣有限公司', '南通纺织装饰配套有限公司', '汇鸿（南通）安全用品有限公司',
      '江苏中新资源集团有限公司', '江苏苏通碳纤维有限公司', '南通世纪东恒手套有限公司',
      '江苏广和科发机电制造有限公司', '江苏泓丰线业科技有限公司', '江苏泽宇森碳纤维科技股份有限公司',
      '江苏九州星际新材料有限公司', '江苏红金顶织造有限公司', '江苏宝缦家纺科技有限公司',
      '南通天虹纺织科技有限公司', '江苏九鼎工业材料有限公司', '江苏德来利纺织科技有限公司',
      '紫罗兰家纺科技股份有限公司', '赛得利（南通）纤维有限公司', '江苏斯得福纺织股份有限公司',
      '南通海汇科技发展有限公司', '恒劢安全防护用品（南通）有限公司', '南通哥班玻璃纤维制品有限公司',
      '南通曼蒂家用纺织品有限公司', '江苏巨佰羊毛制品有限公司', '亿华高新材料（南通）有限公司',
      '南通强生新材料科技股份有限公司', '南通苍峰新材料科技有限公司', '海安启弘纺织科技有限公司',
      '江苏恒科新材料有限公司', '南通百纳数码新材料有限公司', '江苏优风环保科技有限公司',
      '江苏帕科医疗股份有限公司', '南通欣颐家纺有限公司', '江苏锐晟纺织科技有限公司',
      '江苏鑫轮纳米生物科技有限公司', '南通宏大实验仪器有限公司', '江苏爱吉科纺织机械有限公司',
      '江苏大生集团有限公司', '南通惠通纺织器材有限公司', '南通三瑞纺织科技有限公司',
      '南通中邦丝织有限公司', '江苏金由新材料有限公司', '江苏鸿顺合纤科技有限公司',
      '江华新材料科技（江苏）有限公司', '南通荣荟新材料科技有限公司', '南通强生石墨烯科技有限公司',
      '物产中大金轮蓝海股份有限公司', '江苏金太阳家用纺织品有限公司', '南通大东有限公司',
      '江苏田园新材料股份有限公司', '南通恒尚新材料科技有限公司', '南通兴达贝妮梦家用纺织品有限公司',
      '江苏美罗家用纺织品有限公司', '南通华强布业有限公司', '金轮针布（江苏）有限公司',
      '江苏老裁缝家纺工业有限公司', '南通品旺家纺科技有限公司', '南通恒绮纺织有限公司',
      '南通文凯化纤有限公司', '南通神马线业有限公司', '江苏羽安纤维科技有限公司',
      '南通锦琪合纤有限公司', '南通金余纺塑有限公司', '江苏金三发卫生材料科技有限公司',
      '南通神龙化纤绳业有限公司', '南通新绿叶非织造布有限公司', '江苏大达麻纺织科技有限公司',
      '江苏华艺服饰有限公司', '南通赛晖科技发展股份有限公司', '南通如日纺织有限公司',
      '南通牧野织物有限公司', '鑫缘茧丝绸集团股份有限公司', '南通寝尚纺织品有限公司',
      '海安县联发张氏色织有限公司', '南通世纪之花纺织印染有限公司', '江苏九州星际高性能纤维制品有限公司',
      '江苏昌邦安防科技股份有限公司', '江苏璟邦新材料有限公司', '江苏轩达高分子材料有限公司',
      '东丽酒伊织染（南通）有限公司', '江苏柏琳家用纺织品有限公司', '江苏鑫缘丝绸科技有限公司',
      '南通永盛汇维仕纤维新材料有限公司', '江苏永银化纤有限公司', '东丽纤维研究所（中国）有限公司',
      '南通海汇纺织科技有限公司', '江苏州际数码印花有限公司', '江苏千瑞纺织科技有限公司',
      '江苏文凤化纤集团有限公司', '赛立特（南通）安全用品有限公司', '江苏金呢工程织物股份有限公司',
      '南通森友炭纤维有限公司', '江苏衣依新材料有限公司', '江苏神韵绳缆有限公司',
      '江苏集萃先进纤维材料研究所有限公司', '江苏格颖纺织有限公司', '南通东帝纺织品有限公司',
      '南通双弘纺织有限公司', '江苏金太阳纺织科技股份有限公司', '南通得力纺织科技有限公司',
      '江苏祥顺布业有限公司', '江苏迈思德超净科技有限公司', '科德宝宝翎衬布（南通）有限公司',
      '南通市辉鑫玻璃纤维有限公司', '东丽合成纤维（南通）有限公司', '南通醋酸纤维有限公司',
      '江苏九鼎特种纤维有限公司', '江苏千金宏帆纺织品有限公司', '江苏泛亚劳护用品有限公司',
      '罗莱生活科技股份有限公司', '欣润新材料科技（江苏）有限公司', '南通虹纬纺织有限公司',
      '江苏华峰超纤材料有限公司', '南通新源特种纤维有限公司', '江苏金秋弹性织物有限公司',
    ],
  }

  // 企业画像弹窗状态
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalData, setModalData] = useState<ModalData | null>(null)

  const openCompanyModal = async (name: string) => {
    setSelectedCompany(name)
    setModalOpen(true)
    setModalLoading(true)
    setModalData(null)
    try {
      const res = (await industryChainApi.getDirectoryEnterprises({ search: name, limit: 1 })) as any
      const list = res?.data?.list || []
      const item = list.find((e: any) => e.name === name)
      if (!item) { setModalData({ error: 'not_found', name }); return }
      const modalRes = (await industryChainApi.getEnterpriseModal(item.id)) as any
      setModalData(modalRes?.data || modalRes)
    } catch (err) { console.error('企业画像加载失败:', err); setModalData({ error: 'failed', name }) }
    finally { setModalLoading(false) }
  }

  const handleCloseModal = () => { setModalOpen(false); setModalData(null); setSelectedCompany(null) }

  // 产教适配数据
  const [adaptationData, setAdaptationData] = useState<AdaptationData | null>(null)
  const [adaptationLoading, setAdaptationLoading] = useState(false)

  // 访企拓岗企业画像弹窗
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setAdaptationLoading(true)
        const res = await industryEduAdaptationApi.getAdaptation() as any
        setAdaptationData(res?.data || null)
      } catch (err) {
        console.error('产教适配数据加载失败:', err)
      } finally {
        setAdaptationLoading(false)
      }
    })()
  }, [])

  // 综合适配度颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'orange'
    return 'red'
  }

  // 匹配度颜色
  const getMatchTag = (match: string) => {
    switch (match) {
      case 'strong': return <Tag color="green">强</Tag>
      case 'medium': return <Tag color="orange">中</Tag>
      case 'weak': return <Tag color="red">弱</Tag>
      default: return <Tag>{match}</Tag>
    }
  }

  // 领域状态
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'strong': return <Tag color="green">强覆盖</Tag>
      case 'medium': return <Tag color="orange">中覆盖</Tag>
      case 'weak': return <Tag color="red">弱覆盖</Tag>
      default: return <Tag>{status}</Tag>
    }
  }

  // Tab1: 产教适配可视化分析（动态数据）
  const renderAdaptationTab = () => {
    if (!adaptationData) {
      return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>数据加载中...</div>
    }

    const { eduJobComparison, courseMatrix, domainAnalysis, overallAssessment, patentEnterpriseMatching, topEnterprises, techCourseMapping } = adaptationData

    // 岗位-领域覆盖矩阵列头
    const matrixColumns = [
      { title: '岗位', dataIndex: 'position', key: 'position', width: 140 },
      ...eduJobComparison.workDomains.map((d) => ({
        title: d.code,
        dataIndex: d.code,
        key: d.code,
        width: 80,
        render: (v: string) => v === '强' ? <Tag color="green">强</Tag> : v === '一般' ? <Tag color="orange">一般</Tag> : '—',
      })),
    ]

    return (
      <Row gutter={[16, 16]}>
        {/* 专业与岗位基本信息对照 */}
        <Col span={24}>
          <Card title="专业与岗位基本信息对照" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <h4 style={{ marginBottom: 12 }}>专业信息</h4>
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="专业名称">{eduJobComparison.majorInfo.name}</Descriptions.Item>
                  <Descriptions.Item label="专业代码">{eduJobComparison.majorInfo.code}</Descriptions.Item>
                  <Descriptions.Item label="院校">{eduJobComparison.majorInfo.school}</Descriptions.Item>
                  <Descriptions.Item label="层次">{eduJobComparison.majorInfo.level}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <h4 style={{ marginBottom: 12 }}>岗位能力画像摘要（南通纺织服装产业）</h4>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Statistic title="岗位总量" value={eduJobComparison.jobOverview.totalPositions} suffix="条" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="P50薪资" value={eduJobComparison.jobOverview.p50Salary} prefix="¥" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="江苏岗位" value={eduJobComparison.jobOverview.JiangsuPositions} suffix="条" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="最高薪方向" value={eduJobComparison.jobOverview.topSalary} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 工作领域 */}
        <Col span={24}>
          <Card title="工作领域与典型岗位" size="small">
            <Table
              dataSource={eduJobComparison.workDomains}
              rowKey="code"
              pagination={false}
              size="small"
              columns={[
                { title: '编号', dataIndex: 'code', width: 60 },
                { title: '工作领域', dataIndex: 'name' },
                {
                  title: '典型工作任务',
                  dataIndex: 'tasks',
                  render: (tasks: string[]) => (
                    <List size="small" dataSource={tasks} renderItem={(t) => <List.Item>{t}</List.Item>} />
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 岗位-领域覆盖矩阵 */}
        <Col span={24}>
          <Card title="岗位 × 工作领域覆盖矩阵" size="small">
            <Table
              dataSource={eduJobComparison.jobCoverageMatrix}
              rowKey="position"
              pagination={false}
              size="small"
              columns={matrixColumns}
            />
          </Card>
        </Col>

        {/* 课程-岗位匹配 */}
        <Col span={24}>
          <Card title="职责域 × 人培课程矩阵分析" size="small">
            <Table
              dataSource={courseMatrix.courses}
              rowKey="name"
              pagination={false}
              size="small"
              columns={[
                { title: '课程名称', dataIndex: 'name', width: 220 },
                { title: '学分', dataIndex: 'credits', width: 60, render: (v: number) => <strong>{v}</strong> },
                { title: '匹配方向', dataIndex: 'direction', width: 180 },
                { title: '岗位需求数', dataIndex: 'jobCount', width: 100, render: (v: number) => v > 0 ? <strong>{v.toLocaleString()}</strong> : '—' },
                { title: '覆盖度', dataIndex: 'match', width: 80, render: getMatchTag },
              ]}
            />
            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>方向覆盖度总结</h4>
              <Table
                dataSource={courseMatrix.domainSummary}
                rowKey="direction"
                pagination={false}
                size="small"
                columns={[
                  { title: '方向', dataIndex: 'direction', width: 160 },
                  { title: '核心课程', dataIndex: 'coreCourse' },
                  { title: '岗位数', dataIndex: 'jobCount', width: 80, render: (v: number) => <strong>{v.toLocaleString()}</strong> },
                  { title: 'P50薪资', dataIndex: 'salary', width: 80 },
                  { title: '诊断', dataIndex: 'status', width: 100, render: getStatusTag },
                  { title: '建议', dataIndex: 'note', render: (v: string) => <span style={{ fontSize: 12, color: '#666' }}>{v}</span> },
                ]}
              />
            </div>
          </Card>
        </Col>

        {/* 逐域详细分析 */}
        <Col span={24}>
          <Card title="逐域详细分析" size="small">
            <Table
              dataSource={domainAnalysis}
              rowKey="domain"
              pagination={false}
              size="small"
              columns={[
                { title: '领域', dataIndex: 'domain', width: 240 },
                {
                  title: '核心课程',
                  dataIndex: 'coreCourses',
                  render: (courses: string[]) => courses.map((c) => <Tag key={c} style={{ marginRight: 4 }}>{c}</Tag>),
                },
                { title: '差距分析', dataIndex: 'gap', render: (v: string) => <span style={{ color: '#d43a3a' }}>{v}</span> },
                { title: '改进建议', dataIndex: 'suggestion' },
                { title: '市场需求', dataIndex: 'marketDemand', width: 180 },
              ]}
            />
          </Card>
        </Col>

        {/* 综合适配度评估 */}
        <Col span={24}>
          <Card title="综合适配度评估" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="综合适配度"
                  value={overallAssessment.score}
                  suffix="分"
                  valueStyle={{ color: getScoreColor(overallAssessment.score), fontSize: 36 }}
                />
                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <Tag color={overallAssessment.grade === '强覆盖' ? 'green' : overallAssessment.grade === '中覆盖' ? 'orange' : 'red'}>
                    {overallAssessment.grade}
                  </Tag>
                </div>
              </Col>
              <Col span={18}>
                <p style={{ color: '#666', lineHeight: 1.8 }}>{overallAssessment.conclusion}</p>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <h4 style={{ color: '#52c41a' }}>✓ 方案优势</h4>
                <ul style={{ paddingInlineStart: 20, margin: 0, fontSize: 13, color: '#666' }}>
                  {overallAssessment.strengths.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
                </ul>
              </Col>
              <Col span={12}>
                <h4 style={{ color: '#ff4d4f' }}>✗ 存在短板</h4>
                <ul style={{ paddingInlineStart: 20, margin: 0, fontSize: 13, color: '#666' }}>
                  {overallAssessment.weaknesses.map((w, i) => <li key={i} style={{ marginBottom: 4 }}>{w}</li>)}
                </ul>
              </Col>
            </Row>
            <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591' }}>
              <h4 style={{ margin: '0 0 8px', color: '#d43a3a' }}>⚡ 最紧迫三项调整</h4>
              <ol style={{ paddingInlineStart: 20, margin: 0, fontSize: 13, color: '#666' }}>
                {overallAssessment.top3Adjustments.map((a, i) => <li key={i} style={{ marginBottom: 4 }}>{a}</li>)}
              </ol>
            </div>
          </Card>
        </Col>

      </Row>
    )
  }

  const items = majors.map((major, index) => ({
    key: String(index + 1),
    label: major,
    children: (
      <Tabs
        defaultActiveKey="1"
        type="card"
        items={[
          {
            key: '1',
            label: '产教适配可视化分析',
            children: index === 0 ? renderAdaptationTab() : (
              <div style={{ minHeight: 300, color: '#999', textAlign: 'center', paddingTop: 120 }}>
                暂无数据
                <br />
                <span style={{ fontSize: 12 }}>该专业的产教适配分析数据待补充</span>
              </div>
            ),
          },
          {
            key: '2',
            label: '专利技术趋势分析',
            children: index === 0 && adaptationData ? (() => {
              const { patentEnterpriseMatching, topEnterprises, techCourseMapping } = adaptationData
              return (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card title="专利趋势验证（能力图谱报告）" size="small">
                      <Table
                        dataSource={patentEnterpriseMatching.ipcs}
                        rowKey="ipc"
                        pagination={false}
                        size="small"
                        columns={[
                          { title: 'IPC领域', dataIndex: 'ipc', width: 80 },
                          { title: '技术领域', dataIndex: 'field' },
                          { title: '专利数', dataIndex: 'count', width: 70, render: (v: number) => <strong>{v}</strong> },
                          { title: '增速', dataIndex: 'growth', width: 100 },
                          { title: '课程建议', dataIndex: 'course', render: (v: string) => <span style={{ fontSize: 12 }}>{v}</span> },
                        ]}
                      />
                      <div style={{ marginTop: 12 }}>
                        <h4 style={{ fontSize: 13, marginBottom: 8 }}>高校创新主体</h4>
                        <List size="small" dataSource={patentEnterpriseMatching.topUniversities} renderItem={(u) => (
                          <List.Item>
                            <Tag color="blue">{u.name}</Tag>
                            <span style={{ marginLeft: 8, fontSize: 12 }}>{u.patents}件专利</span>
                          </List.Item>
                        )} />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <h4 style={{ fontSize: 13, marginBottom: 8 }}>企业创新主体</h4>
                        <List size="small" dataSource={patentEnterpriseMatching.topEnterprises} renderItem={(e) => (
                          <List.Item>
                            <Tag color="cyan">{e.name}</Tag>
                            <span style={{ marginLeft: 8, fontSize: 12 }}>{e.patents}件专利</span>
                          </List.Item>
                        )} />
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="产业学院共建优先对象（Top10）" size="small">
                      <List
                        dataSource={topEnterprises}
                        renderItem={(e, index) => (
                          <List.Item style={{ padding: '6px 0' }}>
                            <List.Item.Meta
                              avatar={<Tag color="geekblue" style={{ fontSize: 14, padding: '2px 8px' }}>{index + 1}</Tag>}
                              title={
                                <span style={{ fontWeight: 600 }}>
                                  {e.name}
                                  <Tag color="default" style={{ marginLeft: 8, fontSize: 11 }}>{e.city}</Tag>
                                </span>
                              }
                              description={
                                <div style={{ fontSize: 12, color: '#666' }}>
                                  <div>
                                    <Tag color="blue" style={{ marginRight: 4 }}>{e.chainSegment}</Tag>
                                    <span style={{ color: '#999' }}>专利 {e.patentCount} 件 · 增速 {e.growth > 0 ? '+' : ''}{e.growth}%</span>
                                  </div>
                                  <div style={{ marginTop: 4 }}>
                                    {(e.tags || []).map((tag: string) => <Tag key={tag} color="cyan" style={{ marginRight: 4, fontSize: 11 }}>{tag}</Tag>)}
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col span={14}>
                    <Card title="技术热点课程映射表（课程推荐）" size="small">
                      <Table
                        dataSource={techCourseMapping.hotFields}
                        rowKey="field"
                        pagination={false}
                        size="small"
                        columns={[
                          { title: '热点方向', dataIndex: 'field', width: 120 },
                          { title: 'IPC类别', dataIndex: 'ipc', width: 100 },
                          { title: '专利数', dataIndex: 'patents', width: 80, render: (v: number) => v > 0 ? <strong>{v}</strong> : '—' },
                          { title: '增速趋势', dataIndex: 'growthRate', width: 120 },
                          { title: '课程建议', dataIndex: 'suggestedCourse', render: (v: string) => <span style={{ fontSize: 12, color: '#0c8a74' }}>{v}</span> },
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col span={10}>
                    <Card title="实训项目建议开发清单" size="small">
                      <List
                        dataSource={techCourseMapping.trainingProjects}
                        renderItem={(item, index) => (
                          <List.Item>
                            <Tag color="purple" style={{ marginRight: 8 }}>{index + 1}</Tag>
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
              )
            })() : (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="专业—企业协同创新对接表" size="small">
                    <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>对接表格展示</div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="产业学院共建优先对象（Top10）" size="small">
                    <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>对接表格展示</div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="技术热点课程映射表（课程推荐）" size="small">
                    <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>技术热点与课程映射关系</div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="实训项目建议开发清单" size="small">
                    <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>建议开发的实训项目列表</div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '3',
            label: '诊断报告',
            children: (
              <div>
                <Card>
                  <List
                    dataSource={years}
                    renderItem={(year) => {
                      const key = `${major}-${year}`
                      const hasReport = !!REPORT_PATHS[key]
                      const isExpanded = expandedPreview === key

                      return (
                        <>
                          <List.Item
                            actions={[
                              hasReport ? (
                                <Button
                                  type="link"
                                  icon={<EyeOutlined />}
                                  onClick={() => setExpandedPreview(isExpanded ? null : key)}
                                >
                                  {isExpanded ? '收起' : '在线预览'}
                                </Button>
                              ) : (
                                <Button type="link" icon={<EyeOutlined />} disabled>
                                  暂无报告
                                </Button>
                              ),
                              hasReport ? (
                                <Button
                                  type="link"
                                  icon={<DownloadOutlined />}
                                  onClick={() => {
                                    const url = REPORT_PATHS[key]!
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `现代纺织专业设置诊断报告-${year}.html`
                                    a.click()
                                  }}
                                >
                                  下载PDF
                                </Button>
                              ) : (
                                <Button type="link" icon={<DownloadOutlined />} disabled>
                                  暂无
                                </Button>
                              ),
                            ]}
                          >
                            <List.Item.Meta
                              title={`${major} - ${year}诊断报告`}
                              description={
                                hasReport
                                  ? `生成时间：${year.slice(0, 4)}-12-30 · 基于南通经开区产业数据与招聘大数据`
                                  : '报告待生成'
                              }
                            />
                          </List.Item>

                          {/* 在线预览展开区 */}
                          {isExpanded && hasReport && (
                            <div style={{ margin: '0 0 12px 80px' }}>
                              <div className="report-preview-card">
                                <div className="report-preview-header">
                                  <span className="report-preview-title">📄 {major} · {year} · 在线预览</span>
                                  <Button size="small" onClick={() => setExpandedPreview(null)}>关闭</Button>
                                </div>
                                <iframe
                                  src={REPORT_PATHS[key]}
                                  title={`${major}诊断报告`}
                                  className="report-preview-iframe"
                                  sandbox="allow-scripts allow-same-origin"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )
                    }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: '4',
            label: '人才培养方案',
            children: (
              <Card>
                <List
                  dataSource={years}
                  renderItem={(year) => (
                    <List.Item actions={[
                      <Button type="link" icon={<EyeOutlined />}>查看</Button>,
                      <Button type="link" icon={<DownloadOutlined />}>下载</Button>,
                    ]}>
                      <List.Item.Meta title={`${major} - ${year}人才培养方案`} description="学校提供的人才培养方案文档" />
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
          {
            key: '5',
            label: '毕业生质量报告',
            children: (
              <Card>
                <List
                  dataSource={years}
                  renderItem={(year) => (
                    <List.Item actions={[
                      <Button type="link" icon={<EyeOutlined />}>查看</Button>,
                      <Button type="link" icon={<DownloadOutlined />}>下载</Button>,
                    ]}>
                      <List.Item.Meta title={`${major} - ${year}毕业生质量报告`} description="就业率、专业对口率、用人单位满意度等数据" />
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
          {
            key: '6',
            label: '访企拓岗企业名录',
            children: (
              <Card>
                {visitCompanies[major] ? (() => {
                  const companies = visitCompanies[major]
                  return (
                    <>
                      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 14, color: '#666' }}>对口画像企业</span>
                        <Tag color="cyan" style={{ fontSize: 14, padding: '2px 12px' }}>{companies.length} 家</Tag>
                        <span style={{ fontSize: 12, color: '#999' }}>数据源：南通纺织产教图谱平台</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {companies.map((name, i) => (
                          <Tag key={i} color="geekblue" style={{ fontSize: 12, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1890ff')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
                            onClick={() => openCompanyModal(name)}>
                            {name.replace('有限公司', '').replace('股份有限公司', '')}
                          </Tag>
                        ))}
                      </div>
                    </>
                  )
                })() : (
                  <div style={{ minHeight: 400, color: '#999', textAlign: 'center', paddingTop: 180 }}>
                    区域企业画像与访企拓岗记录
                    <br />
                    <span style={{ fontSize: 12 }}>展示已访问企业、合作意向、岗位需求等信息</span>
                  </div>
                )}
              </Card>
            ),
          },
        ]}
      />
    ),
  }))

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>专业诊断报告</h1>
      <Card>
        <Tabs defaultActiveKey="1" tabPosition="left" items={items} />
      </Card>

      {/* 访企拓岗企业画像弹窗 */}
      <Modal
        open={!!selectedCompany}
        onCancel={handleCloseModal}
        footer={null}
        width={1080}
        centered
        destroyOnClose
        className="edir-modal"
        title={null}
      >
        {modalLoading ? (
          <div className="edir-loading"><Spin size="large" /></div>
        ) : !modalData || (modalData as any).error ? (
          <div className="edir-loading"><Empty description={(modalData as any)?.error === 'not_found' ? '未找到该企业画像数据' : (modalData as any)?.error === 'failed' ? '企业画像加载失败' : '暂无数据'} /></div>
        ) : (() => {
          const d = modalData!
          const analysis = d.analysis || { brief: '', majors: [], eduView: '', jobView: '', riskFlags: [], decision: '', decisionReason: '' }
          const honors = d.honors || []
          const demandBuckets = d.demandBuckets || []
          const supplyProfiles = d.supplyProfiles || []
          const insuredTrend = d.insuredTrend || []
          const scores = d.scores || {}
          const recruitment = d.recruitment || { total: 0, jobs: [] as any[] }
          const meta = decisionMeta(analysis.decision || '')
          const jobs = recruitment.jobs?.slice(0, 8) || []
          const dims = DIM_ORDER.filter((dd) => scores?.[dd] != null)
          const insuredLatest = (trend: { year?: number; count?: number }[]): number | null => {
            if (!trend?.length) return null
            const withCount = trend.filter((x) => x.count != null)
            if (!withCount.length) return null
            const last = withCount[withCount.length - 1]
            return typeof last.count === 'number' ? last.count : null
          }
          return (
          <div className="edir-body">
            {/* 头部 */}
            <div className="edir-head">
              <div className="edir-head-main">
                <div className="edir-name-row">
                  <h3>{d.name}</h3>
                  <span className={`decision-badge ${meta.cls}`}>{meta.label}</span>
                </div>
                <div className="edir-tags">
                  {d.category ? <span className="edir-tag">{d.category}</span> : null}
                  {d.area && d.area !== '—' ? <span className="edir-tag">{d.area}</span> : null}
                  {d.rating != null ? <span className="edir-tag">图谱评级 {d.rating.toFixed(1)}</span> : null}
                  {analysis.majors?.slice(0, 4).map((m) => (
                    <span className="edir-tag" key={m}>{m}</span>
                  ))}
                </div>
                {analysis.brief ? <p className="edir-brief">{analysis.brief}</p> : null}
              </div>
            </div>

            {/* 决策卡 */}
            <div className={`edir-decision ${meta.cls}`}>
              <span className="edir-decision-big">{meta.label}</span>
              <p>{analysis.decisionReason || analysis.jobView || '暂无决策说明'}</p>
            </div>

            {/* 01 企业能力分析 */}
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
                    dims.map((dd) => {
                      const v = Math.min(5, Math.max(0, scores?.[dd] ?? 0))
                      return (
                        <div className="edir-score-row" key={dd}>
                          <span className="edir-score-lb">{dd}</span>
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

            {/* 02 产教合作评估 */}
            <div className="edir-sec">
              <div className="edir-sec-head">
                <span className="section-index">02</span>
                <h4>产教合作评估</h4>
              </div>
              <div className="edir-coop">
                <div className="edir-coop-card edu">
                  <h5>院校合作视角</h5>
                  <p>{analysis.eduView || '暂无合作视角分析'}</p>
                </div>
                <div className="edir-coop-card job">
                  <h5>岗位与就业视角</h5>
                  <p>{analysis.jobView || '暂无就业视角分析'}</p>
                </div>
              </div>
              {(d.qualsSrc || honors.length > 0) && (
                <div className="edir-quals">
                  <span className="edir-quals-lb">资质荣誉</span>
                  {d.qualsSrc
                    ? d.qualsSrc.split(/[，,、]/).filter(Boolean).slice(0, 5).map((q) => (
                        <span className="edir-tag qual" key={q}>{q}</span>
                      ))
                    : null}
                  {honors.slice(0, 5).map((h) => (
                    <span className="edir-tag qual" key={h}>{h}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 03 人才需求实况 */}
            <div className="edir-sec">
              <div className="edir-sec-head">
                <span className="section-index">03</span>
                <h4>人才需求实况</h4>
                {recruitment.total != null ? (
                  <span className="edir-sec-note">在招 {recruitment.total} 个岗位</span>
                ) : null}
              </div>
              <div className="edir-kpis">
                <div className="edir-kpi">
                  <div className="edir-kpi-v">{recruitment.total ?? '—'}</div>
                  <div className="edir-kpi-k">在招岗位</div>
                </div>
                <div className="edir-kpi">
                  <div className="edir-kpi-v">{insuredLatest(insuredTrend) ?? '—'}</div>
                  <div className="edir-kpi-k">最新参保人数</div>
                </div>
                <div className="edir-kpi">
                  <div className="edir-kpi-v">{demandBuckets.length}</div>
                  <div className="edir-kpi-k">需求方向</div>
                </div>
              </div>
              {demandBuckets.length > 0 && (
                <div className="edir-bucket-row">
                  {demandBuckets.map((b) => (
                    <span className="edir-tag bucket" key={b}>{b}</span>
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

            {/* 04 对口院校供给 */}
            <div className="edir-sec">
              <div className="edir-sec-head">
                <span className="section-index">04</span>
                <h4>对口院校供给</h4>
                <span className="edir-sec-note">{d.supplyTotal ?? 0} 个专业将其列为强对口</span>
              </div>
              {supplyProfiles.length === 0 ? (
                <Empty description="暂无强对口专业数据" />
              ) : (
                <div className="edir-supply-grid">
                  {supplyProfiles.slice(0, 12).map((p) => (
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
                            <span className="edir-supply-tag" key={t}>{t}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 05 风险提示 */}
            {(analysis.riskFlags || []).length > 0 || d.webNotes ? (
              <div className="edir-sec">
                <div className="edir-sec-head">
                  <span className="section-index">05</span>
                  <h4>风险提示</h4>
                </div>
                {(analysis.riskFlags || []).map((f, idx) => (
                  <div className="edir-flag warn" key={idx}>{f}</div>
                ))}
                {d.webNotes ? <div className="edir-flag info">{d.webNotes}</div> : null}
              </div>
            ) : null}
          </div>
          )
        })()}
      </Modal>
    </div>
  )
}

export default MajorReports