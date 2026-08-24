import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

// ---------- 模块定义 ----------
interface Module {
  key: string
  icon: React.ReactNode
  title: string
  desc: string
  color: string
  lightBg: string
  link: string
  linkLabel: string
  subModules: SubModule[]
}

interface SubModule {
  title: string
  path: string
}

const MODULES: Module[] = [
  {
    key: 'macro',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    ),
    title: '宏观经济数据',
    desc: '南通经开区产业发展规划看板与区域经济指标总览，支撑产教融合决策',
    color: '#1d4ed8',
    lightBg: '#eff6ff',
    link: '/macro/planning',
    linkLabel: '进入板块 →',
    subModules: [
      { title: '产业发展规划看板', path: '/macro/planning' },
      { title: '区域宏观经济数据', path: '/macro/regional' },
    ],
  },
  {
    key: 'chain',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6-6 6 6"/>
        <path d="M6 15l6 6 6-6"/>
        <line x1="12" y1="3" x2="12" y2="21"/>
      </svg>
    ),
    title: '纺织工业产业链图谱',
    desc: '从上游原材料到下游品牌终端的全链路可视化，关联企业名录与前沿技术分析',
    color: '#2563eb',
    lightBg: '#eff6ff',
    link: '/chain/map',
    linkLabel: '进入板块 →',
    subModules: [
      { title: '产业链图谱', path: '/chain/map' },
      { title: '企业名录', path: '/chain/enterprises' },
      { title: '行业前沿技术分析', path: '/chain/technology' },
    ],
  },
  {
    key: 'position',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: '产业岗位能力图谱',
    desc: '典型岗位能力结构雷达图、DACUM 项目—证书桑基图、岗位需求与市场薪资分析',
    color: '#3b82f6',
    lightBg: '#eff6ff',
    link: '/position/mapping',
    linkLabel: '进入板块 →',
    subModules: [
      { title: '岗位与职业映射图谱', path: '/position/mapping' },
      { title: '市场岗位需求分析', path: '/position/market' },
      { title: '岗位能力图谱', path: '/position/abilities' },
    ],
  },
  {
    key: 'diagnostic',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: '专业诊断报告',
    desc: '以招聘大数据与行业政策为基准，对人才培养方案进行系统性差距分析与优化建议',
    color: '#4f46e5',
    lightBg: '#eef2ff',
    link: '/diagnostic/majors',
    linkLabel: '进入板块 →',
    subModules: [
      { title: '专业诊断报告', path: '/diagnostic/majors' },
    ],
  },
]

// ---------- 单个模块卡片 ----------
const ModuleCard: React.FC<{ mod: Module }> = ({ mod }) => {
  const navigate = useNavigate()

  return (
    <div className="dash-card">
      <div className="dash-card-top">
        <div
          className="dash-card-icon"
          style={{ background: mod.lightBg, color: mod.color }}
        >
          {mod.icon}
        </div>
        <div className="dash-card-info">
          <h3 className="dash-card-name">{mod.title}</h3>
          <p className="dash-card-desc">{mod.desc}</p>
        </div>
      </div>

      <ul className="dash-card-sub">
        {mod.subModules.map((sub, i) => (
          <li key={i} className="dash-sub-item">
            <button
              className="dash-sub-btn"
              onClick={() => navigate(sub.path)}
            >
              <span
                className="dash-sub-dot"
                style={{ background: mod.color }}
              />
              <span>{sub.title}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <button
        className="dash-card-enter"
        style={{ color: mod.color }}
        onClick={() => navigate(mod.link)}
      >
        {mod.linkLabel}
      </button>
    </div>
  )
}

// ---------- 主页面 ----------
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
          <div className="dash-hero-actions">
            <button className="hero-btn-primary" onClick={() => {
              const el = document.querySelector('.dash-modules')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}>
              开始探索
            </button>
            <button className="hero-btn-secondary">
              查看说明文档
            </button>
          </div>
          <div className="dash-hero-stats">
            <div className="dash-stat">
              <span className="dash-stat-num">4</span>
              <span className="dash-stat-label">核心模块</span>
            </div>
            <div className="dash-stat-divider"/>
            <div className="dash-stat">
              <span className="dash-stat-num">9</span>
              <span className="dash-stat-label">功能子页</span>
            </div>
            <div className="dash-stat-divider"/>
            <div className="dash-stat">
              <span className="dash-stat-num">3,778</span>
              <span className="dash-stat-label">岗位数据</span>
            </div>
            <div className="dash-stat-divider"/>
            <div className="dash-stat">
              <span className="dash-stat-num">1</span>
              <span className="dash-stat-label">诊断专业</span>
            </div>
          </div>
        </div>
      </div>

      {/* 模块卡片 */}
      <div className="dash-modules">
        <div className="dash-section-header">
          <h2 className="dash-section-title">功能模块</h2>
          <p className="dash-section-sub">选择您需要的分析工具，快速进入对应功能</p>
        </div>
        <div className="dash-grid">
          {MODULES.map((mod) => (
            <ModuleCard key={mod.key} mod={mod} />
          ))}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="dash-footer">
        <span>© 2026 上海市普陀区中教科产教融合研究院</span>
      </div>
    </div>
  )
}

export default Dashboard
