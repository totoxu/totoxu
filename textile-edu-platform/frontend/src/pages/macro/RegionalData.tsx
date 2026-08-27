import React from 'react'
import { useNavigate } from 'react-router-dom'
import { macroRegions } from '../../data/macroData'
import './RegionalData.css'

// 区域宏观经济数据看板 - 模块首页
// 简要介绍各区域模块，点击卡片进入详细内容
const RegionalData: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="regional-page">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-icon">◈</span>
          <div>
            <h1>区域宏观经济数据看板</h1>
            <p>
              覆盖南通市及国家级园区（高新区 / 经开区）的宏观经济、企业、创新与融资数据，
              点击模块查看详细分析
            </p>
          </div>
        </div>
        <span className="module-tag">2025年度口径</span>
      </div>

      {/* 模块卡片 */}
      <div className="region-grid">
        {macroRegions.map((region) => (
          <div
            className="region-card"
            key={region.id}
            onClick={() => navigate(`/macro/regional/${region.id}`)}
          >
            <div
              className="region-card-top"
              style={{ background: `linear-gradient(135deg, ${region.color}14, transparent)` }}
            >
              <div
                className="region-icon"
                style={{
                  background: `${region.color}1f`,
                  borderColor: `${region.color}40`,
                  color: region.color,
                }}
              >
                {region.icon}
              </div>
              <div className="region-title">
                <h3>{region.shortName}</h3>
                <span>南通市 {region.shortName}</span>
              </div>
              <span className="region-arrow">→</span>
            </div>

            <p className="region-intro">{region.intro}</p>

            <div className="region-metrics">
              {region.headline.map((m, i) => (
                <div className="region-metric" key={i}>
                  <span className="metric-value">
                    {typeof m.value === 'number'
                      ? m.value.toLocaleString()
                      : m.value}
                    {m.unit && <em>{m.unit}</em>}
                  </span>
                  <span className="metric-label">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="region-footer">
              <span>查看详细分析</span>
              <span className="footer-hint">
                {region.id === 'city'
                  ? '宏观经济 · 企业 · 创新 · 融资'
                  : '园区总览 · 园区地图 · 创新要素 · 参考'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 产业链补充信息 */}
      <div className="chain-overview">
        <div className="module-section-head">
          <span className="section-index">Σ</span>
          <h3>纺织工业产业链覆盖概览</h3>
        </div>
        <div className="chain-stats">
          <div className="chain-stat">
            <strong>87</strong>
            <span>产业链环节总数（全国口径）</span>
          </div>
          <div className="chain-stat">
            <strong>125.7万</strong>
            <span>全国纺织工业企业</span>
          </div>
          <div className="chain-stat highlight">
            <strong>75</strong>
            <span>南通市覆盖环节（86.2%）</span>
          </div>
          <div className="chain-stat highlight">
            <strong>43,309</strong>
            <span>南通市纺织工业企业</span>
          </div>
          <div className="chain-stat">
            <strong>62</strong>
            <span>高新区覆盖环节（71.3%）</span>
          </div>
          <div className="chain-stat">
            <strong>17,131</strong>
            <span>高新区纺织工业企业（占全国1.4%）</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegionalData
