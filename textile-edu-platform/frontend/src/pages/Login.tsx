import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 600))

    if (username === 'admin' && password === 'admin123') {
      login({ id: '1', username: 'admin', role: 'admin', name: '系统管理员' })
      navigate('/dashboard')
    } else if (username === 'teacher' && password === 'teacher123') {
      login({ id: '2', username: 'teacher', role: 'teacher', name: '张老师' })
      navigate('/dashboard')
    } else {
      setError('用户名或密码错误，请重试')
    }
    setLoading(false)
  }

  return (
    <div className="login-root">
      {/* ── 左侧视觉面板 ── */}
      <div className="login-visual">
        {/* 动态背景纹理 */}
        <svg className="fabric-svg" aria-hidden="true">
          <defs>
            <pattern id="fp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20h40M20 0v40" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
              <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.07)"/>
            </pattern>
            <linearGradient id="vg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f2b4a"/>
              <stop offset="100%" stopColor="#0a1e36"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#vg)"/>
          <rect width="100%" height="100%" fill="url(#fp)"/>
        </svg>

        {/* 浮动装饰圆 */}
        <div className="orb orb-a"/>
        <div className="orb orb-b"/>
        <div className="orb orb-c"/>

        {/* 内容层 */}
        <div className="visual-content">
          <div className="brand-area">
            <div className="logo-mark">
              {/* 纺织交织图标 */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <path d="M6 18h24M18 6v24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
                <path d="M8 10l20 16M8 26l20-16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              </svg>
            </div>
            <h1 className="brand-name">产教通</h1>
            <p className="brand-tagline">纺织工业产教适配分析与诊断平台</p>
            <p className="brand-sub">江苏工程职业技术学院</p>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-num">7</span>
              <span className="stat-label">大产业模块</span>
            </div>
            <div className="stat-divider"/>
            <div className="stat-item">
              <span className="stat-num">50+</span>
              <span className="stat-label">合作企业</span>
            </div>
            <div className="stat-divider"/>
            <div className="stat-item">
              <span className="stat-num">200+</span>
              <span className="stat-label">岗位图谱</span>
            </div>
          </div>

          <div className="feature-list">
            <div className="feature-row">
              <span className="feat-dot"/>
              <span>产业链全景图谱 · 企业能力匹配</span>
            </div>
            <div className="feature-row">
              <span className="feat-dot"/>
              <span>宏观经济数据 · 岗位需求分析</span>
            </div>
            <div className="feature-row">
              <span className="feat-dot"/>
              <span>专业诊断报告 · 产教适配评估</span>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="visual-footer">
          <span>© 2026 江苏工程职业技术学院</span>
        </div>
      </div>

      {/* ── 右侧登录面板 ── */}
      <div className="login-form-area">
        <div className="form-card">
          <div className="form-header">
            <p className="form-welcome">欢迎回来</p>
            <h2 className="form-title">登录您的账号</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* 用户名 */}
            <div className="field-group">
              <label htmlFor="login-username" className="field-label">用户名</label>
              <div className="input-wrapper">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError('') }}
                  className="field-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* 密码 */}
            <div className="field-group">
              <label htmlFor="login-password" className="field-label">密码</label>
              <div className="input-wrapper">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="field-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-btn"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="error-banner" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* 选项行 */}
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="custom-checkbox"/>
                <span>记住登录状态</span>
              </label>
              <button type="button" className="forgot-link">忘记密码？</button>
            </div>

            {/* 登录按钮 */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-spinner"/>
              ) : null}
              <span>{loading ? '登录中...' : '登 录'}</span>
            </button>
          </form>

          {/* 演示账号 */}
          <div className="demo-hint">
            <p className="hint-label">演示账号</p>
            <div className="demo-accounts">
              <div className="demo-item">
                <span className="demo-role">管理员</span>
                <code>admin / admin123</code>
              </div>
              <div className="demo-item">
                <span className="demo-role">教师</span>
                <code>teacher / teacher123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
