import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './MainLayout.css'

// 导航菜单配置 - 严格按文档模块结构
interface MenuChild {
  key: string
  label: string
  icon?: string
}

interface MenuGroup {
  key: string
  label: string
  icon: string
  children?: MenuChild[]
}

const MENU_GROUPS: MenuGroup[] = [
  {
    key: 'overview',
    label: '平台总览',
    icon: '◈',
    children: [
      { key: '/dashboard', label: '数据概览' },
    ],
  },
  {
    key: 'macro',
    label: '宏观经济数据',
    icon: '◉',
    children: [
      { key: '/macro/planning', label: '产业发展规划看板' },
      { key: '/macro/regional', label: '区域宏观经济数据' },
    ],
  },
  {
    key: 'chain',
    label: '纺织工业产业链图谱',
    icon: '◎',
    children: [
      { key: '/chain/map', label: '产业链图谱' },
      { key: '/chain/enterprises', label: '企业名录' },
      { key: '/chain/technology', label: '行业前沿技术分析' },
    ],
  },
  {
    key: 'position',
    label: '产业岗位能力图谱',
    icon: '◆',
    children: [
      { key: '/position/mapping', label: '岗位与职业映射图谱' },
      { key: '/position/market', label: '市场岗位需求分析' },
      { key: '/position/abilities', label: '岗位能力图谱' },
    ],
  },
  {
    key: 'diagnostic',
    label: '专业诊断报告',
    icon: '✎',
    children: [
      { key: '/diagnostic/majors', label: '专业诊断报告' },
    ],
  },
]

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  // 角色显示名
  const roleNames: Record<string, string> = {
    admin: '管理员',
    teacher: '教师',
    student: '学生',
    guest: '访客',
  }

  return (
    <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      {/* ============ 侧边栏 ============ */}
      <a href="#main-content" className="skip-link">跳转到主要内容</a>
      <aside className="sidebar">
        {/* Logo区域 */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="logo-text">
            <strong>产教适配平台</strong>
            <span>纺织工业 · 诊断分析</span>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="sidebar-nav">
          {MENU_GROUPS.map((group) => (
            <div className="nav-group" key={group.key}>
              <div className="nav-group-title">
                <span className="nav-group-icon">{group.icon}</span>
                <span>{group.label}</span>
              </div>
              <div className="nav-group-items">
                {group.children?.map((child) => {
                  const active = location.pathname === child.key ||
                    location.pathname.startsWith(child.key + '/')
                  return (
                    <button
                      key={child.key}
                      className={`nav-item ${active ? 'is-active' : ''}`}
                      onClick={() => handleMenuClick(child.key)}
                    >
                      <span className="nav-item-dot" />
                      <span>{child.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '▸' : '◂'}
        </button>
      </aside>

      {/* ============ 主区域 ============ */}
      <div className="main-area">
        {/* 顶栏 */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="page-breadcrumb">
              <span className="crumb-root">上海市普陀区中教科产教融合研究院</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">产教适配分析与诊断平台</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* 通知 */}
            <button className="topbar-icon-btn" title="通知">
              <span className="badge-dot" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>

            {/* 用户信息 */}
            <div className="user-menu-wrap">
              <button
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0) || '客'}
                </div>
                <div className="user-info">
                  <strong>{user?.name || '访客'}</strong>
                  <span>{roleNames[user?.role || 'guest']}</span>
                </div>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.department || '纺织学院'}</span>
                  </div>
                  <button onClick={() => navigate('/profile')}>个人中心</button>
                  <button onClick={() => navigate('/settings')}>系统设置</button>
                  <div className="dropdown-divider" />
                  <button className="danger" onClick={handleLogout}>退出登录</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="content-area" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
