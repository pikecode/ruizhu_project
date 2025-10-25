import { Table, Button, Space, Card, Tag } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'

export default function UsersPage() {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joined',
      key: 'joined',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />}>
            Edit
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
      id: 'USR001',
      username: 'admin',
      email: 'admin@ruizhu.com',
      role: 'admin',
      joined: '2024-01-01',
    },
    {
      key: '2',
      id: 'USR002',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
      joined: '2024-01-10',
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        <h1>Users</h1>

        <Card style={{ marginTop: 24 }}>
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    </Layout>
  )
}
