import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store'
import { authService } from '@/services/auth'
import { getErrorMessage } from '@/utils/helpers'
import styles from './Login.module.scss'

interface LoginFormValues {
  username: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setToken, setIsLoading } = useAuthStore()
  const [form] = Form.useForm()

  const onFinish = async (values: LoginFormValues) => {
    try {
      setIsLoading(true)
      const response = await authService.adminLogin(values)

      setToken(response.access_token)
      setUser(response.user)

      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      message.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h1>睿珠管理系统</h1>
          <p>电商管理平台</p>
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          <p>💡 默认测试账户：</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            超级管理员 admin / admin123456<br/>
            经理 manager / manager123456<br/>
            操作员 operator / operator123456
          </p>
        </div>
      </Card>
    </div>
  )
}
