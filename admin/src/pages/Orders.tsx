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
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `¥${total.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />}>
            View
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />}>
            Delete
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
        <h1>Orders</h1>

        <Card style={{ marginTop: 24 }}>
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    </Layout>
  )
}
