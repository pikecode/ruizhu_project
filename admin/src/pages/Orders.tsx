import { Table, Button, Space, Card, Tag } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'

export default function OrdersPage() {
  const statusColor: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'cyan',
    delivered: 'green',
    cancelled: 'red',
  }

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '总额',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `¥${total.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: '操作',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const data = [
    {
      key: '1',
      id: 'ORD001',
      user: 'John Doe',
      total: 2999.99,
      status: 'delivered',
      created: '2024-01-15',
    },
    {
      key: '2',
      id: 'ORD002',
      user: 'Jane Smith',
      total: 1499.99,
      status: 'shipped',
      created: '2024-01-14',
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        <h1>订单</h1>

        <Card style={{ marginTop: 24 }}>
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    </Layout>
  )
}
