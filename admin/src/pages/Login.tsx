import { useState } from 'react'
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
      const response = await authService.login(values)

      setToken(response.accessToken)
      setUser(response.user)

      message.success('Login successful')
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
          <h1>Ruizhu Admin</h1>
          <p>E-Commerce Management Platform</p>
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          <p>Demo: Use any username/password to test</p>
        </div>
      </Card>
    </div>
  )
}
