import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// 页面
import Login from './pages/Login'
import Forbidden from './pages/Forbidden'
import Dashboard from './pages/Dashboard'

// 宏观经济数据
import PlanningBoard from './pages/macro/PlanningBoard'
import RegionalData from './pages/macro/RegionalData'
import RegionDetail from './pages/macro/RegionDetail'

// 产业链图谱
import ChainMap from './pages/chain/ChainMap'
import EnterpriseDirectory from './pages/chain/EnterpriseDirectory'
import TechAnalysis from './pages/chain/TechAnalysis'

// 岗位能力图谱
import JobMapping from './pages/position/JobMapping'
import MarketAnalysis from './pages/position/MarketAnalysis'
import AbilityGraph from './pages/position/AbilityGraph'

// 专业诊断报告
import MajorReports from './pages/diagnostic/MajorReports'
import TextileReport from './pages/diagnostic/TextileReport'

// 路由权限说明：
// - 所有业务页面包裹在 ProtectedRoute 中，未登录跳转 /login
// - 系统管理相关页面限制 admin 角色
// - /403 展示无权限提示

const App: React.FC = () => {
  return (
    <Routes>
      {/* 登录页 */}
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      {/* 业务页面（需要登录） */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 平台总览 */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* 宏观经济数据 */}
        <Route path="macro/planning" element={<PlanningBoard />} />
        <Route path="macro/regional" element={<RegionalData />} />
        <Route path="macro/regional/:regionId" element={<RegionDetail />} />

        {/* 纺织工业产业链图谱 */}
        <Route path="chain/map" element={<ChainMap />} />
        <Route path="chain/enterprises" element={<EnterpriseDirectory />} />
        <Route path="chain/technology" element={<TechAnalysis />} />

        {/* 产业岗位能力图谱 */}
        <Route path="position/mapping" element={<JobMapping />} />
        <Route path="position/market" element={<MarketAnalysis />} />
        <Route path="position/abilities" element={<AbilityGraph />} />

        {/* 专业诊断报告 */}
        <Route path="diagnostic/majors" element={<MajorReports />} />

        {/* 系统管理（仅管理员） */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <div className="module-page">
                <div className="page-header">
                  <h1>个人中心</h1>
                  <p>账号信息与个人设置</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <div className="module-page">
                <div className="page-header">
                  <h1>系统设置</h1>
                  <p>仅管理员可访问的权限管理区域</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 未匹配路由 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
