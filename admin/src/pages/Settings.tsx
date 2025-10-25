import { Form, Input, Button, Card, message } from 'antd'
import Layout from '@/components/Layout'

export default function SettingsPage() {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('Settings:', values)
    message.success('Settings saved successfully')
  }

  return (
    <Layout>
      <div className="p-3">
        <h1>Settings</h1>

        <Card style={{ marginTop: 24, maxWidth: 600 }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Site Name" name="siteName">
              <Input placeholder="Ruizhu Admin" />
            </Form.Item>

            <Form.Item label="Site URL" name="siteUrl">
              <Input placeholder="https://admin.ruizhu.com" />
            </Form.Item>

            <Form.Item label="Admin Email" name="adminEmail">
              <Input type="email" placeholder="admin@ruizhu.com" />
            </Form.Item>

            <Form.Item label="API URL" name="apiUrl">
              <Input placeholder="http://localhost:3000/api/v1" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  )
}
