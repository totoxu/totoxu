import React from 'react'
import { Card, Tabs, Row, Col, Table } from 'antd'

const IndustryChain: React.FC = () => {
  const columns = [
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '所属节点',
      dataIndex: 'node',
      key: 'node',
    },
    {
      title: '企业规模',
      dataIndex: 'scale',
      key: 'scale',
    },
    {
      title: '年产值',
      dataIndex: 'output',
      key: 'output',
    },
  ]

  const mockData = [
    {
      key: '1',
      name: '示例企业A',
      node: '纺织原料',
      scale: '大型',
      output: '5.2亿元',
    },
    {
      key: '2',
      name: '示例企业B',
      node: '纺织加工',
      scale: '中型',
      output: '2.8亿元',
    },
  ]

  const items = [
    {
      key: '1',
      label: '产业链图谱',
      children: (
        <Card>
          <div style={{ minHeight: 500, color: '#999', textAlign: 'center', paddingTop: 220 }}>
            纺织工业产业链图谱可视化 - AntV G6
            <br />
            <span style={{ fontSize: 12 }}>展示产业链上下游关系、关键节点等</span>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: '重点企业名录',
      children: (
        <div>
          <Table columns={columns} dataSource={mockData} pagination={{ pageSize: 10 }} />
          <div style={{ marginTop: 16, color: '#999', textAlign: 'center' }}>
            共200家重点企业数据
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: '企业画像',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="企业基本信息" size="small">
              <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>
                企业详细信息展示
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="企业发展趋势" size="small">
              <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>
                趋势图表 - ECharts
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '4',
      label: '前沿技术分析',
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="南通纺织技术主题热度 TOP15" size="small">
              <div style={{ minHeight: 300, color: '#999', textAlign: 'center', paddingTop: 120 }}>
                技术热度排行榜 - ECharts
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="技术需求向专业的传导映射" size="small">
              <div style={{ minHeight: 300, color: '#999', textAlign: 'center', paddingTop: 120 }}>
                映射关系图 - AntV G6
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="综合匹配度评估与建议" size="small">
              <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>
                评估报告内容展示
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>纺织工业产业链图谱</h1>
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  )
}

export default IndustryChain
