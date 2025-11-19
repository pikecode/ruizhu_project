import {
  Table,
  Button,
  Space,
  Card,
  Input,
  Select,
  Popconfirm,
  message,
  Row,
  Col,
  Modal,
  Tag,
  Badge,
  Statistic,
} from 'antd'
import {
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { consultationsService, Consultation } from '@/services/consultations'

// 状态颜色映射
const STATUS_COLOR_MAP: Record<string, string> = {
  unread: 'red',
  read: 'blue',
  processing: 'orange',
  completed: 'green',
}

// 状态文本映射
const STATUS_TEXT_MAP: Record<string, string> = {
  unread: '未读',
  read: '已读',
  processing: '处理中',
  completed: '已完成',
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    processing: 0,
    completed: 0,
  })
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)

  // Load statistics
  useEffect(() => {
    loadStats()
  }, [])

  // Load consultations when filters change
  useEffect(() => {
    loadConsultations()
  }, [pagination.current, pagination.pageSize, statusFilter])

  const loadStats = async () => {
    try {
      const data = await consultationsService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadConsultations = async () => {
    try {
      setLoading(true)
      const data = await consultationsService.getConsultations({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter as any,
        keyword: searchKeyword || undefined,
      })
      setConsultations(data.items)
      setPagination({ ...pagination, total: data.total })
    } catch (error) {
      message.error('加载咨询列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setPagination({ ...pagination, current: 1 })
  }

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value)
    setPagination({ ...pagination, current: 1 })
  }

  const handleReset = () => {
    setSearchKeyword('')
    setStatusFilter(undefined)
    setPagination({ ...pagination, current: 1 })
    loadStats()
  }

  const handleViewDetail = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setDetailVisible(true)

    // Mark as read if unread
    if (consultation.status === 'unread') {
      updateConsultationStatus(consultation.id, 'read')
    }
  }

  const updateConsultationStatus = async (
    id: number,
    status: 'unread' | 'read' | 'processing' | 'completed',
  ) => {
    try {
      await consultationsService.updateConsultationStatus(id, status)
      await loadConsultations()
      await loadStats()
      message.success('状态更新成功')
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await consultationsService.deleteConsultation(id)
      message.success('咨询删除成功')
      await loadConsultations()
      await loadStats()
    } catch (error) {
      message.error('删除咨询失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的咨询')
      return
    }

    Modal.confirm({
      title: '批量删除咨询',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条咨询吗？此操作无法撤销。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setDeleteLoading(true)
          const ids = selectedRowKeys as number[]
          await consultationsService.deleteConsultations(ids)
          message.success(`成功删除 ${selectedRowKeys.length} 条咨询`)
          setSelectedRowKeys([])
          await loadConsultations()
          await loadStats()
        } catch (error) {
          message.error('删除部分咨询失败')
        } finally {
          setDeleteLoading(false)
        }
      },
    })
  }

  const columns = [
    {
      title: '用户信息',
      key: 'user',
      width: 150,
      render: (_: any, record: Consultation) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.userName}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.userPhone}</div>
        </div>
      ),
    },
    {
      title: '产品信息',
      key: 'product',
      width: 200,
      render: (_: any, record: Consultation) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.categoryName}</div>
        </div>
      ),
    },
    {
      title: '咨询内容',
      key: 'content',
      width: 200,
      render: (_: any, record: Consultation) => (
        <div style={{ fontSize: '12px', maxHeight: '60px', overflow: 'hidden' }}>
          {record.remarks || '(无备注)'}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={STATUS_COLOR_MAP[status] || 'default'}>
          {STATUS_TEXT_MAP[status] || status}
        </Tag>
      ),
    },
    {
      title: '时间',
      key: 'time',
      width: 150,
      render: (_: any, record: Consultation) => (
        <div style={{ fontSize: '12px' }}>
          <div>{new Date(record.createdAt).toLocaleDateString()}</div>
          <div style={{ color: '#999' }}>
            {new Date(record.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Consultation) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Select
            size="small"
            value={record.status}
            onChange={(status) => updateConsultationStatus(record.id, status)}
            style={{ width: '80px' }}
            options={[
              { label: '未读', value: 'unread' },
              { label: '已读', value: 'read' },
              { label: '处理中', value: 'processing' },
              { label: '已完成', value: 'completed' },
            ]}
          />
          <Popconfirm
            title="删除咨询"
            description="确定要删除此咨询吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <h1 style={{ margin: '0 0 24px 0' }}>产品咨询管理</h1>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={4.8}>
            <Card>
              <Statistic
                title="总咨询数"
                value={stats.total}
                prefix={<Badge count={stats.total} showZero color="#1890ff" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4.8}>
            <Card>
              <Statistic
                title="未读"
                value={stats.unread}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<Badge count={stats.unread} color="#ff4d4f" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4.8}>
            <Card>
              <Statistic
                title="已读"
                value={stats.read}
                valueStyle={{ color: '#1890ff' }}
                prefix={<Badge count={stats.read} color="#1890ff" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4.8}>
            <Card>
              <Statistic
                title="处理中"
                value={stats.processing}
                valueStyle={{ color: '#faad14' }}
                prefix={<Badge count={stats.processing} color="#faad14" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4.8}>
            <Card>
              <Statistic
                title="已完成"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<Badge count={stats.completed} color="#52c41a" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Input.Search
                placeholder="按用户名或电话搜索"
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="按状态筛选"
                allowClear
                value={statusFilter}
                onChange={handleStatusChange}
                style={{ width: '100%' }}
                options={[
                  { label: '未读', value: 'unread' },
                  { label: '已读', value: 'read' },
                  { label: '处理中', value: 'processing' },
                  { label: '已完成', value: 'completed' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                block
              >
                重置
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                block
                disabled={selectedRowKeys.length === 0}
              >
                批量删除
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card loading={loading}>
          {/* Selection Info */}
          {selectedRowKeys.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f5f7fa',
                borderRadius: '4px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#666' }}>
                已选择 <strong style={{ color: '#1890ff' }}>{selectedRowKeys.length}</strong> 条咨询
              </span>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                loading={deleteLoading}
              >
                批量删除
              </Button>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={consultations.map((c) => ({ ...c, key: c.id }))}
            rowSelection={{
              selectedRowKeys,
              onChange: (newSelectedRowKeys: React.Key[]) => setSelectedRowKeys(newSelectedRowKeys),
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条咨询`,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, current: page, pageSize })
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title="咨询详情"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={800}
        >
          {selectedConsultation && (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {/* User Info */}
              <div style={{ marginBottom: '24px' }}>
                <h3>用户信息</h3>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div>
                      <strong>姓名：</strong>
                      {selectedConsultation.userName}
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <strong>电话：</strong>
                      {selectedConsultation.userPhone}
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <strong>邮箱：</strong>
                      {selectedConsultation.userEmail || '-'}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Product Info */}
              <div style={{ marginBottom: '24px' }}>
                <h3>产品信息</h3>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div>
                      <strong>产品名称：</strong>
                      {selectedConsultation.productName}
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <strong>分类：</strong>
                      {selectedConsultation.categoryName}
                    </div>
                  </Col>
                  {/* 珠宝(2)和香水(4)没有颜色字段 */}
                  {selectedConsultation.categoryId !== 2 && selectedConsultation.categoryId !== 4 && (
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>颜色：</strong>
                        {selectedConsultation.color || '-'}
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Category-Specific Info */}
              {selectedConsultation.categoryId === 1 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3>服装尺码信息</h3>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>通用尺码：</strong>
                        {selectedConsultation.clothingSize || '-'}
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>身高：</strong>
                        {selectedConsultation.height || '-'}
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>体重：</strong>
                        {selectedConsultation.weight || '-'}
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>胸围：</strong>
                        {selectedConsultation.chest || '-'}
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>腰围：</strong>
                        {selectedConsultation.waist || '-'}
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>臀围：</strong>
                        {selectedConsultation.hip || '-'}
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {selectedConsultation.categoryId === 3 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3>鞋码信息</h3>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>鞋码（欧码）：</strong>
                        {selectedConsultation.shoeSize || '-'}
                      </div>
                    </Col>
                  </Row>
                </div>
              )}


              {/* Remarks */}
              {selectedConsultation.remarks && (
                <div style={{ marginBottom: '24px' }}>
                  <h3>备注信息</h3>
                  <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    {selectedConsultation.remarks}
                  </div>
                </div>
              )}

              {/* Status and Time */}
              <div style={{ marginBottom: '24px' }}>
                <h3>其他信息</h3>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div>
                      <strong>状态：</strong>
                      <Tag
                        color={STATUS_COLOR_MAP[selectedConsultation.status]}
                        style={{ marginLeft: '8px' }}
                      >
                        {STATUS_TEXT_MAP[selectedConsultation.status]}
                      </Tag>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <strong>提交时间：</strong>
                      {new Date(selectedConsultation.createdAt).toLocaleString()}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}
