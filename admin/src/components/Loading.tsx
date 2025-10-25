import { Spin } from 'antd'

export default function Loading() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <Spin size="large" />
    </div>
  )
}
