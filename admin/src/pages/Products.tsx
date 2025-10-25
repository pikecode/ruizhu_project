import { Table, Button, Space, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'

export default function ProductsPage() {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
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
      id: 'PRD001',
      name: 'Premium Watch',
      category: 'Accessories',
      price: 999.99,
      stock: 50,
    },
    {
      key: '2',
      id: 'PRD002',
      name: 'Designer Handbag',
      category: 'Bags',
      price: 1999.99,
      stock: 30,
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        <div className="flex-between mb-2">
          <h1>Products</h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        </div>

        <Card>
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    </Layout>
  )
}
