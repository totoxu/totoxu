import { Router } from 'express'
import { Request, Response } from 'express'
import { DiagnosticService } from '../services/diagnostic.service'

const router = Router()
const diagnosticService = new DiagnosticService()

// 获取所有诊断报告（列表，不含全文）
router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await diagnosticService.getReports()
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
    })
  }
})

// 获取诊断报告详情（含 Markdown 全文）
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await diagnosticService.getReportById(String(req.params.id))
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Report not found',
      timestamp: Date.now(),
    })
  }
})

// 按专业获取最新诊断报告
router.get('/major/:majorName', async (req: Request, res: Response) => {
  try {
    const data = await diagnosticService.getReportByMajor(String(req.params.majorName))
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Report not found',
      timestamp: Date.now(),
    })
  }
})

export default router
