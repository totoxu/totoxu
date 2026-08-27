import { Router } from 'express'
import { Request, Response } from 'express'
import { EnterpriseService } from '../services/enterprise.service'

const router = Router()
const enterpriseService = new EnterpriseService()

// 获取企业列表（支持分页、搜索、筛选）
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit, search, category, status } = req.query

    const result = await enterpriseService.getEnterprises({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      category: category as string,
      status: status as string,
    })

    res.json({
      code: 200,
      message: 'success',
      data: result,
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

// 获取企业详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const enterprise = await enterpriseService.getEnterpriseById(id)

    res.json({
      code: 200,
      message: 'success',
      data: enterprise,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Enterprise not found',
      timestamp: Date.now(),
    })
  }
})

// 获取企业完整画像
router.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const profile = await enterpriseService.getEnterpriseProfile(id)

    res.json({
      code: 200,
      message: 'success',
      data: profile,
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Enterprise not found',
      timestamp: Date.now(),
    })
  }
})

// 获取统计数据
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const stats = await enterpriseService.getStatistics()

    res.json({
      code: 200,
      message: 'success',
      data: stats,
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

// 获取推荐企业（用于产教融合）
router.get('/recommend/by-major', async (req: Request, res: Response) => {
  try {
    const { major, limit } = req.query

    const enterprises = await enterpriseService.getRecommendedEnterprises({
      major: major as string,
      limit: limit ? parseInt(limit as string) : undefined,
    })

    res.json({
      code: 200,
      message: 'success',
      data: enterprises,
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

// 创建企业
router.post('/', async (req: Request, res: Response) => {
  try {
    const enterprise = await enterpriseService.bulkCreate([req.body])

    res.json({
      code: 200,
      message: 'Created successfully',
      data: enterprise[0],
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

// 更新企业
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const enterprise = await enterpriseService.updateEnterprise(id, req.body)

    res.json({
      code: 200,
      message: 'Updated successfully',
      data: enterprise,
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

// 删除企业
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    await enterpriseService.deleteEnterprise(id)

    res.json({
      code: 200,
      message: 'Deleted successfully',
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
