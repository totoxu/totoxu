import React from 'react'
import { Card, Tabs, Row, Col, Tag } from 'antd'

const PositionAbility: React.FC = () => {
  const positions = [
    '纺织设备维护工程师',
    '服装设计师',
    '服装销售',
    '纺织工艺师',
    '质量检验员',
  ]

  const items = [
    {
      key: '1',
      label: '岗位与职业映射',
      children: (
        <Card>
          <div style={{ minHeight: 400, color: '#999', textAlign: 'center', paddingTop: 180 }}>
            岗位与职业映射关系图谱 - AntV G6
            <br />
            <span style={{ fontSize: 12 }}>展示岗位与国家职业分类标准的映射关系</span>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: '市场岗位需求分析',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="岗位类别分布" size="small">
              <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                饼图/环形图 - ECharts
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="需求热度 TOP10 岗位" size="small">
              <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                柱状图 - ECharts
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="各岗位类别平均薪资对比" size="small">
              <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                柱状图/折线图 - ECharts
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="学历要求分布" size="small">
              <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                饼图 - ECharts
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '3',
      label: '岗位能力图谱',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8 }}>热门岗位（市场需求量排名前5）：</span>
            {positions.map((pos, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                {pos}
              </Tag>
            ))}
          </div>
          <Tabs
            defaultActiveKey="1"
            type="card"
            items={positions.map((pos, index) => ({
              key: String(index + 1),
              label: pos,
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card title="岗位能力模型" size="small">
                      <div style={{ minHeight: 300, color: '#999', textAlign: 'center', paddingTop: 120 }}>
                        雷达图/能力矩阵 - ECharts
                        <br />
                        <span style={{ fontSize: 12 }}>展示专业技能、通用技能、职业素养等维度</span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="核心职责与相关证书映射" size="small">
                      <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                        职责列表与证书对照表
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="典型工作任务分析" size="small">
                      <div style={{ minHeight: 250, color: '#999', textAlign: 'center', paddingTop: 100 }}>
                        DACUM任务分析表
                      </div>
                    </Card>
                  </Col>
                </Row>
              ),
            }))}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>纺织工业产业岗位能力图谱</h1>
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  )
}

export default PositionAbility
