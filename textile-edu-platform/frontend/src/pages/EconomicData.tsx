import React from 'react'
import { Card, Tabs, Row, Col } from 'antd'

const EconomicData: React.FC = () => {
  const items = [
    {
      key: '1',
      label: '产业发展规划',
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="国家十五五发展规划" size="small">
              <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>
                规划内容展示区域
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="江苏省十五五发展规划" size="small">
              <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>
                规划内容展示区域
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="南通市十五五发展规划" size="small">
              <div style={{ minHeight: 200, color: '#999', textAlign: 'center', paddingTop: 80 }}>
                规划内容展示区域
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: '区域宏观经济数据',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="南通市宏观经济数据" size="small">
              <div style={{ minHeight: 300, color: '#999', textAlign: 'center', paddingTop: 120 }}>
                经济数据图表 - ECharts
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="园区地图分布" size="small">
              <div style={{ minHeight: 300, color: '#999', textAlign: 'center', paddingTop: 120 }}>
                地图可视化 - AntV L7
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="国家级高新区宏观经济数据" size="small">
              <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                园区总览、创新要素数据展示
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="国家级经开区宏观经济数据" size="small">
              <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                园区总览、创新要素数据展示
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>宏观经济数据</h1>
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  )
}

export default EconomicData
