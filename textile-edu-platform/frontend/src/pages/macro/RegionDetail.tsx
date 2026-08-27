import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRegionById } from '../../data/macroData'
import './RegionalData.css'

// 区域详情页（简化版）
const RegionDetail: React.FC = () => {
  const { regionId } = useParams<{ regionId: string }>()
  const navigate = useNavigate()

  const region = getRegionById(regionId || '')

  if (!region) {
    return (
      <div className="module-page">
        <div className="page-header">
          <h1>未找到该区域</h1>
          <button className="back-link" onClick={() => navigate('/macro/regional')}>
            ← 返回区域看板
          </button>
        </div>
      </div>
    )
  }

  // 宏观指标
  const renderMetrics = (items: { label: string; value: number | string; unit?: string; desc?: string }[]) => (
    <div className="detail-metric-grid">
      {items.map((m, i) => (
        <div className="detail-metric-item" key={i}>
          <span className="detail-metric-value">
            {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
            {m.unit && <em>{m.unit}</em>}
          </span>
          <span className="detail-metric-label">{m.label}</span>
          {m.desc && <span className="detail-metric-desc">{m.desc}</span>}
        </div>
      ))}
    </div>
  )

  // 关键信息
  const renderInfoList = (info: { label: string; value: string }[]) => (
    <div className="detail-info-list">
      {info.map((item, i) => (
        <div className="detail-info-row" key={i}>
          <span className="detail-info-label">{item.label}</span>
          <span className="detail-info-value">{item.value}</span>
        </div>
      ))}
    </div>
  )

  // 专利分布条形图
  const renderPatentBars = (items: { label: string; value: number; pct: number }[]) => {
    const max = Math.max(...items.map((i) => i.value))
    return (
      <div className="detail-patent-bars">
        {items.map((item, i) => (
          <div className="detail-patent-row" key={i}>
            <span className="detail-patent-label">{item.label}</span>
            <div className="detail-patent-track">
              <div
                className="detail-patent-fill"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="detail-patent-pct">{item.pct}%</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="regional-page">
      {/* 头部 */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/macro/regional')}>
          ← 返回
        </button>
        <div className="detail-title">
          <span className="detail-icon" style={{ color: region.color }}>
            {region.icon}
          </span>
          <div>
            <h1>{region.name}</h1>
            <p>{region.intro}</p>
          </div>
        </div>
      </div>

      {/* 主导产业标签 */}
      {region.overview.industries && region.overview.industries.length > 0 && (
        <div className="industry-chips">
          <span className="chips-label">主导产业</span>
          {region.overview.industries.map((ind, i) => (
            <span className="industry-chip" key={i}>{ind}</span>
          ))}
        </div>
      )}

      {/* 宏观经济 / 园区总览 */}
      <div className="detail-block">
        <div className="block-head">
          <span className="section-index">01</span>
          <h3>{region.overview.title}</h3>
        </div>
        {renderMetrics(region.overview.keyMetrics)}
        {region.overview.info && renderInfoList(region.overview.info)}
      </div>

      {/* 企业数据（仅城市有） */}
      {region.companies && region.companies.length > 0 && (
        <div className="detail-block">
          <div className="block-head">
            <span className="section-index">02</span>
            <h3>企业数据</h3>
          </div>
          {renderMetrics(region.companies)}
          {region.listingBreakdown && (
            <div className="detail-info-panel">
              <h4>上市企业分布</h4>
              {renderInfoList(
                region.listingBreakdown.map((m) => ({
                  label: m.label,
                  value: `${m.value}${m.unit || ''}`,
                }))
              )}
            </div>
          )}
        </div>
      )}

      {/* 创新要素 */}
      {region.innovation && region.innovation.length > 0 && (
        <div className="detail-block">
          <div className="block-head">
            <span className="section-index">03</span>
            <h3>创新要素</h3>
          </div>
          {renderMetrics(region.innovation)}
          {region.patentBreakdown && region.patentBreakdown.length > 0 && (
            <div className="detail-info-panel">
              <h4>专利授权类型分布</h4>
              {renderPatentBars(region.patentBreakdown)}
            </div>
          )}
        </div>
      )}

      {/* 融资数据 */}
      {region.financing && region.financing.length > 0 && (
        <div className="detail-block">
          <div className="block-head">
            <span className="section-index">04</span>
            <h3>融资数据</h3>
          </div>
          {renderMetrics(region.financing)}
        </div>
      )}

      {/* 数据参考 */}
      {region.reference && region.reference.length > 0 && (
        <div className="detail-block">
          <div className="block-head">
            <span className="section-index">05</span>
            <h3>数据参考</h3>
          </div>
          <div className="reference-list">
            {region.reference.map((ref, i) => (
              <div className="reference-item" key={i}>
                <span className="ref-dot" />
                <span>{ref}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="back-link" onClick={() => navigate('/macro/regional')}>
        ← 返回区域看板
      </button>
    </div>
  )
}

export default RegionDetail
