import { Row, Col, Card, Statistic } from 'antd'
import { ShoppingCartOutlined, UserOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-3">
        <h1>Dashboard</h1>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={1234}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={567}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={890}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={123456}
                prefix={<DollarOutlined />}
                precision={2}
                suffix="CNY"
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Recent Orders">
              <p>Recent orders list will be displayed here</p>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="User Statistics">
              <p>User statistics chart will be displayed here</p>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  )
}
