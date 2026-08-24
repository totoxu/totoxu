import React, { useEffect, useRef, useState } from 'react'
import './TextileReport.css'

const REPORT_PATH = '/reports/现代纺织专业设置诊断报告.html'
const REPORT_TITLE = '现代纺织专业设置诊断报告'

/** 从完整 HTML 中提取内容 + 样式 */
function extractReport(raw: string): { styles: string; content: string } {
  // 提取 <style> 标签内容
  const styleMatch = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  const styles = styleMatch ? styleMatch[1] : ''

  // 提取 <body> 内容
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const content = bodyMatch ? bodyMatch[1].trim() : raw

  return { styles, content }
}

const TextileReport: React.FC = () => {
  const [styles, setStyles] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(REPORT_PATH)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then(text => {
        console.log('[TextileReport] fetched', text.length, 'chars')
        const { styles: s, content: c } = extractReport(text)
        setStyles(s)
        setContent(c)
      })
      .catch(err => {
        console.error('[TextileReport] fetch error:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="report-page">
        <div className="report-toolbar">
          <div className="report-toolbar-left">
            <span className="report-toolbar-icon">📄</span>
            <div>
              <h1 className="report-toolbar-title">{REPORT_TITLE}</h1>
              <p className="report-toolbar-sub">江苏工程职业技术学院 · 现代纺织技术</p>
            </div>
          </div>
          <div className="report-toolbar-right">
            <button className="btn-print" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="12" height="9" rx="1" />
                <path d="M2 13h12M5 7v6M9 7v6" />
              </svg>
              下载 PDF
            </button>
          </div>
        </div>
        <div className="report-loading">
          <div className="report-spinner" />
          <p>正在加载诊断报告…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="report-page">
        <div className="report-toolbar">
          <div className="report-toolbar-left">
            <span className="report-toolbar-icon">📄</span>
            <div>
              <h1 className="report-toolbar-title">{REPORT_TITLE}</h1>
              <p className="report-toolbar-sub">加载失败 — {error}</p>
            </div>
          </div>
        </div>
        <div className="report-error">
          <p className="report-error-title">报告加载失败</p>
          <p className="report-error-msg">{error}</p>
          <p className="report-error-hint">请确认文件已部署至 /public/reports/ 目录</p>
        </div>
      </div>
    )
  }

  return (
    <div className="report-page">
      {/* 注入原始报告样式（body/background/font 等） */}
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}

      {/* 顶部操作栏 */}
      <div className="report-toolbar">
        <div className="report-toolbar-left">
          <span className="report-toolbar-icon">📄</span>
          <div>
            <h1 className="report-toolbar-title">{REPORT_TITLE}</h1>
            <p className="report-toolbar-sub">江苏工程职业技术学院 · 现代纺织技术</p>
          </div>
        </div>
        <div className="report-toolbar-right">
          <button className="btn-print" onClick={handlePrint}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="9" rx="1" />
              <path d="M2 13h12M5 7v6M9 7v6" />
            </svg>
            下载 PDF
          </button>
        </div>
      </div>

      {/* 报告内容区 */}
      <div
        ref={containerRef}
        className="report-scroll-container"
        onScroll={(e) => {
          const el = e.currentTarget
          const btn = document.getElementById('scroll-top-btn')
          if (btn) btn.style.opacity = el.scrollTop > 300 ? '1' : '0'
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* 返回顶部 */}
      <button
        id="scroll-top-btn"
        className="scroll-top-btn"
        onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ opacity: 0 }}
      >
        ↑
      </button>

      <style>{`
        @media print {
          .report-toolbar, .scroll-top-btn { display: none !important; }
          .report-scroll-container { overflow: visible !important; max-height: none !important; }
          .report-page { background: #fff !important; }
        }
      `}</style>
    </div>
  )
}

export default TextileReport
