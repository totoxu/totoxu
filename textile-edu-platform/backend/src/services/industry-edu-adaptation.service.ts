import { AppDataSource } from '../config/database'
import { IndustryEduAdaptationReport } from '../entities/IndustryEduAdaptationReport'

export class IndustryEduAdaptationService {
  private repo = AppDataSource.getRepository(IndustryEduAdaptationReport)

  /**
   * 获取产教适配可视化分析数据
   */
  async getAdaptation() {
    const report = await this.repo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    })

    if (!report.length) {
      throw new Error('产教适配可视化分析数据不存在')
    }

    return report[0]
  }
}
