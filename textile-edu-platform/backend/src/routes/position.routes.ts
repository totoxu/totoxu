import { Router } from 'express'
import { Request, Response } from 'express'
import { CompetencyMapService } from '../services/competency-map.service'

const router = Router()
const competencyMapService = new CompetencyMapService()

// 获取所有岗位
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      code: 200,
      message: 'success',
      data: [],
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

// 关键岗位能力图谱（桑基图数据 + 能力画像名列表）
router.get('/competency-map', async (req: Request, res: Response) => {
  try {
    const data = await competencyMapService.getMap()
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

// 典型岗位职业能力与课程映射图谱
router.get('/job-competency', async (req: Request, res: Response) => {
  try {
    const data = await competencyMapService.getJobCompetency()
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

// 关键岗位能力分析（岗位类别/热度/薪资/学历 + 职业专业映射）
router.get('/analysis', async (req: Request, res: Response) => {
  try {
    const data = await competencyMapService.getPositionAnalysis()
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

// 关键岗位能力图谱 - 单个岗位能力画像
router.get('/competency-map/:name', async (req: Request, res: Response) => {
  try {
    const data = await competencyMapService.getPositionDetail(String(req.params.name))
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Position detail not found',
      timestamp: Date.now(),
    })
  }
})

// 获取岗位详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    res.json({
      code: 200,
      message: 'success',
      data: { id },
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
