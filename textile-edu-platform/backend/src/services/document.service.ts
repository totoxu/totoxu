import { AppDataSource } from '../config/database'
import { ModuleDocument } from '../entities/ModuleDocument'

export class DocumentService {
  private repo = AppDataSource.getRepository(ModuleDocument)

  async list(module?: string, majorName?: string) {
    const where: Record<string, any> = {}
    if (module) where.module = module
    if (majorName) where.majorName = majorName

    const docs = await this.repo.find({
      where,
      order: { createdAt: 'DESC' },
    })
    return docs.map((d) => ({
      id: d.id,
      module: d.module,
      majorName: d.majorName,
      name: d.name,
      fileType: d.fileType,
      size: d.size,
      uploader: d.uploader,
      createdAt: d.createdAt,
    }))
  }

  async getById(id: string) {
    const doc = await this.repo.findOne({ where: { id } })
    if (!doc) throw new Error('文档不存在')
    return doc
  }

  async remove(id: string) {
    const doc = await this.repo.findOne({ where: { id } })
    if (!doc) throw new Error('文档不存在')
    await this.repo.remove(doc)
    return doc
  }
}
