import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { useAuthStore } from '@/store'
import { routes } from '@/routes'
import '@/styles/globals.scss'

function App() {
  const { hydrate, isLoggedIn } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#007aff',
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App
