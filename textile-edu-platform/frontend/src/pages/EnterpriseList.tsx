import React, { useEffect, useState } from 'react'
import { Table, Input, Select, Card, Statistic, Row, Col, Button, Modal, Descriptions, Tag, Space } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { enterpriseApi } from '../services/api'

const { Search } = Input
const { Option } = Select

interface Enterprise {
  id: string
  name: string
  category: string
  status: string
  staffSize: string
  patentsTotal: number
  address: string
}

const EnterpriseList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [enterprises, setEnterprises] = useState<Enterprise[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statistics, setStatistics] = useState<any>(null)
  const [selectedEnterprise, setSelectedEnterprise] = useState<any>(null)
  const [profileModalVisible, setProfileModalVisible] = useState(false)

  // 获取企业列表
  const fetchEnterprises = async () => {
    setLoading(true)
    try {
      const response = await enterpriseApi.getEnterprises({
        page,
        limit,
        search,
        category,
      })
      setEnterprises(response.data.list)
      setTotal(response.data.total)
    } catch (error) {
      console.error('获取企业列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await enterpriseApi.getStatistics()
      setStatistics(response.data)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 查看企业画像
  const viewProfile = async (id: string) => {
    try {
      const response = await enterpriseApi.getEnterpriseProfile(id)
      setSelectedEnterprise(response.data)
      setProfileModalVisible(true)
    } catch (error) {
      console.error('获取企业画像失败:', error)
    }
  }

  useEffect(() => {
    fetchEnterprises()
  }, [page, limit, search, category])

  useEffect(() => {
    fetchStatistics()
  }, [])

  const columns = [
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === '在业' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '人员规模',
      dataIndex: 'staffSize',
      key: 'staffSize',
      width: 150,
    },
    {
      title: '专利数',
      dataIndex: 'patentsTotal',
      key: 'patentsTotal',
      width: 80,
      sorter: (a: Enterprise, b: Enterprise) => a.patentsTotal - b.patentsTotal,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Enterprise) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewProfile(record.id)}
        >
          查看画像
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>企业名录与画像</h1>

      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="企业总数"
                value={statistics.total}
                suffix="家"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="专利总数"
                value={statistics.patents?.total || 0}
                suffix="件"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均专利数"
                value={statistics.patents?.average || 0}
                precision={1}
                suffix="件/企业"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="在业企业"
                value={
                  statistics.byStatus?.find((s: any) => s.status === '在业')
                    ?.count || 0
                }
                suffix="家"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索企业名称"
            allowClear
            onSearch={(value) => setSearch(value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setCategory(value || '')}
          >
            <Option value="纺织工业">纺织工业</Option>
          </Select>
          <Button onClick={() => { setSearch(''); setCategory('') }}>
            重置
          </Button>
        </Space>
      </Card>

      {/* 企业列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={enterprises}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPage(page)
              setLimit(pageSize)
            },
          }}
        />
      </Card>

      {/* 企业画像详情Modal */}
      <Modal
        title={selectedEnterprise?.basic?.name || '企业画像'}
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        width={1000}
        footer={null}
      >
        {selectedEnterprise && (
          <div>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="企业名称" span={2}>
                {selectedEnterprise.basic.name}
              </Descriptions.Item>
              <Descriptions.Item label="法定代表人">
                {selectedEnterprise.basic.legalRep}
              </Descriptions.Item>
              <Descriptions.Item label="注册资本">
                {selectedEnterprise.basic.regCapital}
              </Descriptions.Item>
              <Descriptions.Item label="成立日期">
                {selectedEnterprise.basic.founded}
              </Descriptions.Item>
              <Descriptions.Item label="经营状态">
                <Tag color={selectedEnterprise.basic.status === '在业' ? 'green' : 'red'}>
                  {selectedEnterprise.basic.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="人员规模" span={2}>
                {selectedEnterprise.basic.staffSize}
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                {selectedEnterprise.basic.address}
              </Descriptions.Item>
              <Descriptions.Item label="行业分类" span={2}>
                {selectedEnterprise.basic.industry}
              </Descriptions.Item>
              <Descriptions.Item label="经营范围" span={2}>
                {selectedEnterprise.basic.scopeBrief}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="专利信息" bordered column={3} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="专利总数">
                {selectedEnterprise.patents.total}
              </Descriptions.Item>
              <Descriptions.Item label="发明专利">
                {selectedEnterprise.patents.invention}
              </Descriptions.Item>
              <Descriptions.Item label="实用新型">
                {selectedEnterprise.patents.utility}
              </Descriptions.Item>
              <Descriptions.Item label="外观设计">
                {selectedEnterprise.patents.design}
              </Descriptions.Item>
              <Descriptions.Item label="近3年专利" span={2}>
                {selectedEnterprise.patents.recent3y}
              </Descriptions.Item>
            </Descriptions>

            {selectedEnterprise.patents.keyDirs?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>专利关键方向：</h4>
                {selectedEnterprise.patents.keyDirs.map((dir: string, index: number) => (
                  <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                    {dir}
                  </Tag>
                ))}
              </div>
            )}

            {selectedEnterprise.recruitment?.jobs?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>招聘岗位（共{selectedEnterprise.recruitment.total}个）：</h4>
                <Table
                  dataSource={selectedEnterprise.recruitment.jobs}
                  columns={[
                    { title: '岗位', dataIndex: 'title', key: 'title' },
                    { title: '薪资', dataIndex: 'salary', key: 'salary' },
                    { title: '学历', dataIndex: 'edu', key: 'edu' },
                    { title: '经验', dataIndex: 'exp', key: 'exp' },
                  ]}
                  size="small"
                  pagination={false}
                  rowKey="title"
                />
              </div>
            )}

            {selectedEnterprise.analysis && (
              <div style={{ marginTop: 16 }}>
                <h4>产教融合分析：</h4>
                <p><strong>简述：</strong>{selectedEnterprise.analysis.brief}</p>
                <p><strong>对口专业：</strong></p>
                <Space wrap>
                  {selectedEnterprise.analysis.majors?.map((major: string, index: number) => (
                    <Tag key={index} color="green">{major}</Tag>
                  ))}
                </Space>
                <p style={{ marginTop: 8 }}><strong>决策建议：</strong>
                  <Tag color={selectedEnterprise.analysis.decision === '推荐' ? 'success' : 'warning'}>
                    {selectedEnterprise.analysis.decision}
                  </Tag>
                </p>
                <p>{selectedEnterprise.analysis.decision_reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EnterpriseList
