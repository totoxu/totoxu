import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './Forbidden.css'

// 403 无权限页面
const Forbidden: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="forbidden-page">
      <div className="forbidden-code">403</div>
      <h1 className="forbidden-title">访问被拒绝</h1>
      <p className="forbidden-desc">
        当前账号 <strong>{user?.name || ''}</strong>（{user?.role}）
        没有权限访问该页面。<br/>
        如需访问，请联系管理员开通权限。
      </p>
      <div className="forbidden-actions">
        <button className="btn-primary" onClick={() => navigate(-1)}>
          返回上一页
        </button>
        <button className="btn-ghost" onClick={handleLogout}>
          切换账号
        </button>
      </div>
    </div>
  )
}

export default Forbidden
