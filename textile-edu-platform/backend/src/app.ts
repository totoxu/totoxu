import 'reflect-metadata'
import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AppDataSource } from './config/database'

// 加载环境变量
dotenv.config()

// 导入路由
import industryRoutes from './routes/industry.routes'
import industryChainRoutes from './routes/industry-chain.routes'
import positionRoutes from './routes/position.routes'
import enterpriseRoutes from './routes/enterprise.routes'
import diagnosticRoutes from './routes/diagnostic.routes'
import documentRoutes from './routes/document.routes'
import industryEduAdaptationRoutes from './routes/industry-edu-adaptation.routes'

const app: Application = express()
const PORT = process.env.PORT || 5000

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 路由
app.use('/api/v1/industries', industryRoutes)
app.use('/api/v1/industry-chain', industryChainRoutes)
app.use('/api/v1/positions', positionRoutes)
app.use('/api/v1/enterprises', enterpriseRoutes)
app.use('/api/v1/diagnostics', diagnosticRoutes)
app.use('/api/v1/documents', documentRoutes)
app.use('/api/v1/industry-edu-adaptation', industryEduAdaptationRoutes)

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found',
    timestamp: Date.now(),
  })
})

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 500,
    message: err.message || 'Internal server error',
    timestamp: Date.now(),
  })
})

// 初始化数据库并启动服务器
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully')
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
      console.log(`📊 API documentation: http://localhost:${PORT}/api-docs`)
    })
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  })

export default app
