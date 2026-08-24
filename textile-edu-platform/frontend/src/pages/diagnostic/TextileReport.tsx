import React, { useEffect, useRef, useState } from 'react'
import './TextileReport.css'

const REPORT_PATH = '/reports/现代纺织专业设置诊断报告.html'
const REPORT_TITLE = '现代纺织专业设置诊断报告'

const TextileReport: React.FC = () => {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(REPORT_PATH)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then(text => setHtml(text))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      // Show back-to-top when scrolled down more than 300px
      const topBtn = document.getElementById('scroll-top-btn')
      if (topBtn) topBtn.style.opacity = scrollTop > 300 ? '1' : '0'
    }
  }

  if (loading) {
    return (
      <div className="report-page">
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
        <div className="report-error">
          <p className="report-error-title">报告加载失败</p>
          <p className="report-error-msg">{error}</p>
          <p className="report-error-hint">请确认文件已部署至 /public/reports/ 目录</p>
        </div>
      </div>
    )
  }

  // Strip the outer <html>/<head>/<body> tags to render only the content
  const extractBody = (raw: string): string => {
    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    return bodyMatch ? bodyMatch[1] : raw
  }

  const bodyContent = extractBody(html)

  return (
    <div className="report-page">
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
        onScroll={handleScroll}
        dangerouslySetInnerHTML={{ __html: bodyContent }}
      />

      {/* 返回顶部 */}
      <button id="scroll-top-btn" className="scroll-top-btn" onClick={() => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }}>
        ↑
      </button>

      {/* 打印时隐藏工具栏和返回顶部按钮 */}
      <style>{`
        @media print {
          .report-toolbar,
          .scroll-top-btn,
          [id="scroll-top-btn"] { display: none !important; }
          .report-scroll-container {
            overflow: visible !important;
            max-height: none !important;
          }
          body { background: #fff; }
        }
      `}</style>
    </div>
  )
}

export default TextileReport
