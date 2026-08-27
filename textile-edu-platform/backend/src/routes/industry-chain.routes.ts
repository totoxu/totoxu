import { Router } from 'express'
import { Request, Response } from 'express'
import { IndustryChainService } from '../services/industry-chain.service'

const router = Router()
const industryChainService = new IndustryChainService()

router.get('/nodes', async (req: Request, res: Response) => {
  try {
    const data = await industryChainService.getNodeTree()
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

router.get('/nodes/:nodeId/summary', async (req: Request, res: Response) => {
  try {
    const data = await industryChainService.getNodeSummary(String(req.params.nodeId))
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Node not found',
      timestamp: Date.now(),
    })
  }
})

router.get('/nodes/:nodeId/enterprises', async (req: Request, res: Response) => {
  try {
    const { page, limit, search, sourceType } = req.query
    const data = await industryChainService.getNodeEnterprises(String(req.params.nodeId), {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      sourceType: sourceType as string,
    })

    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Node not found',
      timestamp: Date.now(),
    })
  }
})

router.get('/enterprises/:mappingId', async (req: Request, res: Response) => {
  try {
    const data = await industryChainService.getEnterpriseDetail(String(req.params.mappingId))
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Enterprise detail not found',
      timestamp: Date.now(),
    })
  }
})

// 企业名录（仅深度画像企业）
router.get('/directory/enterprises', async (req: Request, res: Response) => {
  try {
    const { page, limit, search, category, decision } = req.query
    const data = await industryChainService.getDirectoryEnterprises({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      category: category as string,
      decision: decision as string,
    })

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

// 企业画像弹窗（能力分析 + 产教合作 + 需求实况 + 对口院校供给）
router.get('/directory/enterprises/:enterpriseId/modal', async (req: Request, res: Response) => {
  try {
    const data = await industryChainService.getEnterpriseModal(String(req.params.enterpriseId))
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Enterprise modal not found',
      timestamp: Date.now(),
    })
  }
})

// 技术前沿分析报告
router.get('/tech-frontier', async (req: Request, res: Response) => {
  try {
    const data = await industryChainService.getTechFrontier(
      req.query.majorKey ? String(req.query.majorKey) : undefined
    )
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Tech frontier data not found',
      timestamp: Date.now(),
    })
  }
})

// 技术前沿分析-总览
router.get('/tech-overview', async (req: Request, res: Response) => {
  try {
    const data = await industryChainService.getTechOverview()
    res.json({
      code: 200,
      message: 'success',
      data,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Tech overview data not found',
      timestamp: Date.now(),
    })
  }
})

export default router
