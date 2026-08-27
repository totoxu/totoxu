import React from 'react'
import './ModulePlaceholder.css'

interface Section {
  title: string
  desc?: string
  badges?: string[]
  placeholder?: string
}

interface ModulePlaceholderProps {
  title: string
  subtitle?: string
  icon?: string
  sections: Section[]
  layout?: 'grid2' | 'grid3' | 'stack'
}

// 通用模块占位组件：展示模块架构，具体内容后续填充
const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  subtitle,
  icon,
  sections,
  layout = 'stack',
}) => {
  return (
    <div className="module-page">
      <div className="page-header">
        <div className="page-title-row">
          {icon && <span className="page-icon">{icon}</span>}
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <span className="module-tag">模块架构</span>
      </div>

      <div className={`module-sections ${layout}`}>
        {sections.map((section, i) => (
          <div className="module-section" key={i}>
            <div className="module-section-head">
              <span className="section-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{section.title}</h3>
              {section.badges && (
                <div className="section-badges">
                  {section.badges.map((b, j) => (
                    <span className="section-badge" key={j}>{b}</span>
                  ))}
                </div>
              )}
            </div>
            {section.desc && <p className="section-desc">{section.desc}</p>}
            <div className="section-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
              <span>{section.placeholder || '数据可视化区域 · 待接入数据'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModulePlaceholder
