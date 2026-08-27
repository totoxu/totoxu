import { Router } from 'express'
import { Request, Response } from 'express'
import { IndustryEduAdaptationService } from '../services/industry-edu-adaptation.service'

const router = Router()
const service = new IndustryEduAdaptationService()

// 获取产教适配可视化分析数据
router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await service.getAdaptation()
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

export default router
