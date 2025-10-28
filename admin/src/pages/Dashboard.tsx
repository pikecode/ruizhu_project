import { Row, Col, Card, Statistic } from 'antd'
import { ShoppingCartOutlined, UserOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-3">
        <h1>仪表板</h1>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="用户总数"
                value={1234}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="产品总数"
                value={567}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="订单总数"
                value={890}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总收入"
                value={123456}
                prefix={<DollarOutlined />}
                precision={2}
                suffix="元"
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="最近订单">
              <p>最近的订单列表将显示在此处</p>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="用户统计">
              <p>用户统计图表将显示在此处</p>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  )
}
