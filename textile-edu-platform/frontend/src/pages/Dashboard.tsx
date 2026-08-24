import React from 'react'
import DashboardBoard from './DashboardBoard'
import './Dashboard.css'

// ── 主页面：保留 Hero + 看板，移除旧模块卡片 ──
const Dashboard: React.FC = () => {
  return (
    <div className="dash-page">
      {/* Hero 区 */}
      <div className="dash-hero">
        <div className="dash-hero-bg-pattern" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)"/>
          </svg>
        </div>
        <div className="dash-hero-glow-1"/>
        <div className="dash-hero-glow-2"/>
        <div className="dash-hero-inner">
          <div className="dash-hero-meta">产教融合 · 数据驱动 · 诊断分析</div>
          <h1 className="dash-hero-title">
            江苏工程职业技术学院
          </h1>
          <p className="dash-hero-sub">纺织工业产教适配分析与诊断平台</p>
          <p className="dash-hero-desc">
            聚焦纺织工业产业链，打通宏观产业数据、岗位能力模型与专业诊断报告，
            为学校专业建设、人才培养方案优化提供数据支撑。
          </p>
          <div className="dash-hero-stats">
            <div className="dash-stat">
              <span className="dash-stat-num">4</span>
              <span className="dash-stat-label">数据屏</span>
            </div>
            <div className="dash-stat-divider"/>
            <div className="dash-stat">
              <span className="dash-stat-num">4,937</span>
              <span className="dash-stat-label">纺织岗位（条）</span>
            </div>
            <div className="dash-stat-divider"/>
            <div className="dash-stat">
              <span className="dash-stat-num">54</span>
              <span className="dash-stat-label">产业链节点</span>
            </div>
          </div>
        </div>
      </div>

      {/* 产教大脑看板 */}
      <DashboardBoard />

      {/* 底部说明 */}
      <div className="dash-footer">
        <span>© 2026 上海市普陀区中教科产教融合研究院</span>
      </div>
    </div>
  )
}

export default Dashboard
