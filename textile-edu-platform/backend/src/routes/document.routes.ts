import { Router } from 'express'
import { Request, Response } from 'express'
import multer from 'multer'
import * as path from 'path'
import * as fs from 'fs'
import { randomUUID } from 'crypto'
import { execSync, spawn } from 'child_process'
import { tmpdir } from 'os'
import { AppDataSource } from '../config/database'
import { ModuleDocument } from '../entities/ModuleDocument'
import { DocumentService } from '../services/document.service'

const router = Router()
const documentService = new DocumentService()
const documentRepo = AppDataSource.getRepository(ModuleDocument)

// 上传目录 + 预览缓存目录（转换工作目录使用 ASCII 路径，避免 LibreOffice 中文路径问题）
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/documents')
const PREVIEW_DIR = path.join(tmpdir(), 'textile_doc_preview')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
fs.mkdirSync(PREVIEW_DIR, { recursive: true })

const ALLOWED_EXT = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md',
]

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXT.includes(ext)) {
      cb(new Error(`不支持的文件类型 ${ext}，仅支持 ${ALLOWED_EXT.join(' ')}`))
      return
    }
    cb(null, true)
  },
})

// ---------- LibreOffice 检测与 PDF 转换 ----------
let sofficePath: string | null = null

function detectSoffice(): string | null {
  if (process.env.SOFFICE_PATH) {
    const p = process.env.SOFFICE_PATH.replace(/^"|"$/g, '')
    if (fs.existsSync(p)) return p
  }
  const candidates = [
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice\\program\\soffice.com',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com',
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  try {
    const found = execSync('where soffice', { encoding: 'utf8', windowsHide: true })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (found.length) return found[0]
  } catch {
    // ignore
  }
  return null
}

function getSoffice(): string | null {
  if (sofficePath === null) sofficePath = detectSoffice()
  return sofficePath
}

function convertToPdf(srcPath: string): Promise<string> {
  const key = path.basename(srcPath)
  const pdfPath = path.join(PREVIEW_DIR, `${key}.pdf`)
  if (fs.existsSync(pdfPath)) return Promise.resolve(pdfPath)

  const soffice = getSoffice()
  if (!soffice) return Promise.reject(new Error('SOFFICE_NOT_AVAILABLE'))

  // LibreOffice 对非 ASCII 路径支持不佳，先复制到 ASCII 临时目录再转换
  const ext = path.extname(srcPath).toLowerCase()
  const workName = `tmp_${randomUUID()}${ext}`
  const workSrc = path.join(PREVIEW_DIR, workName)
  // LibreOffice 输出 PDF 时会将扩展名替换为 .pdf（个别场景保留原扩展名追加），两种都兼容
  const workBase = path.basename(workName, ext)
  const workPdf = path.join(PREVIEW_DIR, `${workBase}.pdf`)
  const workPdfAlt = path.join(PREVIEW_DIR, `${workName}.pdf`)
  fs.copyFileSync(srcPath, workSrc)

  return new Promise((resolve, reject) => {
    const profile = path.join(PREVIEW_DIR, `lo_profile_${randomUUID()}`)
    const args = [
      `-env:UserInstallation=file:///${profile.replace(/\\/g, '/')}`,
      '--headless',
      '--norestore',
      '--nologo',
      '--convert-to',
      'pdf',
      '--outdir',
      PREVIEW_DIR,
      workSrc,
    ]
    const child = spawn(soffice, args, { windowsHide: true })
    const timer = setTimeout(() => {
      child.kill()
      fs.promises.unlink(workSrc).catch(() => {})
      reject(new Error('文档转换超时'))
    }, 120000)

    child.on('close', (code) => {
      clearTimeout(timer)
      fs.promises.unlink(workSrc).catch(() => {})
      const finalPdf = fs.existsSync(workPdf) ? workPdf : fs.existsSync(workPdfAlt) ? workPdfAlt : null
      if (code === 0 && finalPdf) {
        try {
          fs.renameSync(finalPdf, pdfPath)
          resolve(pdfPath)
        } catch (err) {
          reject(err instanceof Error ? err : new Error('文档转换失败'))
        }
      } else {
        reject(new Error('文档转换失败'))
      }
    })
    child.on('error', (err) => {
      clearTimeout(timer)
      fs.promises.unlink(workSrc).catch(() => {})
      reject(err)
    })
  })
}

// ---------- 管理员校验 ----------
function requireAdmin(req: Request, res: Response, next: () => void) {
  const role = String(req.headers['x-user-role'] || '')
  if (role !== 'admin') {
    res.status(403).json({
      code: 403,
      message: '仅系统管理员可执行此操作',
      timestamp: Date.now(),
    })
    return
  }
  next()
}

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
}

const NATIVE_INLINE_EXT = new Set(['.pdf', '.txt', '.md'])
const OFFICE_EXT = new Set(['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'])

function sendFile(res: Response, filePath: string, size: number, fileName: string, inline: boolean) {
  const ext = path.extname(filePath).toLowerCase()
  const mime = MIME_MAP[ext] || 'application/octet-stream'
  res.setHeader('Content-Type', mime)
  res.setHeader('Content-Length', size)
  res.setHeader(
    'Content-Disposition',
    `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(fileName)}`
  )
  fs.createReadStream(filePath).pipe(res)
}

// 文档列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const { module, majorName } = req.query
    const data = await documentService.list(
      module ? String(module) : undefined,
      majorName ? String(majorName) : undefined
    )
    res.json({ code: 200, message: 'success', data, timestamp: Date.now() })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
    })
  }
})

// 上传文档（仅管理员）
router.post('/upload', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ code: 400, message: '未接收到文件', timestamp: Date.now() })
      return
    }

    const { module, majorName, name } = req.body || {}
    // multer 对非 ASCII 文件名按 latin1 解码，这里转回 UTF-8
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const docName = String(name || originalName)
    const doc = documentRepo.create({
      module: String(module || '专业诊断报告'),
      majorName: String(majorName || ''),
      name: docName,
      storedName: file.filename,
      fileType: path.extname(originalName).toLowerCase().replace('.', ''),
      size: file.size,
      uploader: String(req.headers['x-user-username'] || 'admin'),
    })
    await documentRepo.save(doc)

    res.json({
      code: 200,
      message: 'success',
      data: {
        id: doc.id,
        name: doc.name,
        fileType: doc.fileType,
        size: doc.size,
        module: doc.module,
        majorName: doc.majorName,
      },
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

// 删除文档（仅管理员）
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const doc = await documentService.remove(String(req.params.id))
    const filePath = path.join(UPLOAD_DIR, doc.storedName)
    fs.promises.unlink(filePath).catch(() => {})
    // 清理预览缓存
    const pdfPath = path.join(PREVIEW_DIR, `${doc.storedName}.pdf`)
    fs.promises.unlink(pdfPath).catch(() => {})
    res.json({
      code: 200,
      message: 'success',
      data: { id: doc.id },
      timestamp: Date.now(),
    })
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'Document not found',
      timestamp: Date.now(),
    })
  }
})

// 获取文档文件
//  - ?download=1  -> 附件下载
//  - 默认/预览     -> 网页内联：PDF/TXT/MD 直接返回，Office 文档经 LibreOffice 转 PDF 后返回
router.get('/:id/file', async (req: Request, res: Response) => {
  try {
    const doc = await documentService.getById(String(req.params.id))
    const srcPath = path.join(UPLOAD_DIR, doc.storedName)
    if (!fs.existsSync(srcPath)) {
      res.status(404).json({ code: 404, message: '文件不存在', timestamp: Date.now() })
      return
    }

    const ext = `.${doc.fileType}`.toLowerCase()
    const wantDownload = req.query.download === '1'

    // 下载：始终附件
    if (wantDownload) {
      sendFile(res, srcPath, doc.size, doc.name, false)
      return
    }

    // 原生内联：PDF / TXT / MD
    if (NATIVE_INLINE_EXT.has(ext)) {
      sendFile(res, srcPath, doc.size, doc.name, true)
      return
    }

    // Office 文档：转换为 PDF 后内联预览
    if (OFFICE_EXT.has(ext)) {
      try {
        const pdfPath = await convertToPdf(srcPath)
        const pdfSize = fs.statSync(pdfPath).size
        sendFile(res, pdfPath, pdfSize, `${doc.name.replace(/\.[^.]+$/, '')}.pdf`, true)
      } catch (err) {
        console.error('[document] 转换失败:', srcPath, '->', err)
        res.status(415).json({
          code: 415,
          message: '该文档暂不支持在线预览，请下载后查看',
          timestamp: Date.now(),
        })
      }
      return
    }

    // 其他：附件
    sendFile(res, srcPath, doc.size, doc.name, false)
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error instanceof Error ? error.message : 'File not found',
      timestamp: Date.now(),
    })
  }
})

export default router
