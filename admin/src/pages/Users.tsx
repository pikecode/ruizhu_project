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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'joined',
      key: 'joined',
    },
    {
      title: '操作',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />}>
            编辑
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
        <h1>用户</h1>

        <Card style={{ marginTop: 24 }}>
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    </Layout>
  )
}
