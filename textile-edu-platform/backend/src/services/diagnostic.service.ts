import { AppDataSource } from '../config/database'
import { DiagnosticReport } from '../entities/DiagnosticReport'

export class DiagnosticService {
  private repo = AppDataSource.getRepository(DiagnosticReport)

  /**
   * 报告列表（不含全文）。
   */
  async getReports() {
    const reports = await this.repo.find({
      order: { createdAt: 'ASC' },
    })
    return reports.map((r) => ({
      id: r.id,
      majorName: r.majorName,
      year: r.year,
      title: r.title,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  }

  /**
   * 报告详情（含 Markdown 全文）。
   */
  async getReportById(id: string) {
    const report = await this.repo.findOne({ where: { id } })
    if (!report) throw new Error('诊断报告不存在')
    return {
      id: report.id,
      majorName: report.majorName,
      year: report.year,
      title: report.title,
      markdown: report.markdown,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }
  }

  /**
   * 按专业获取最新报告。
   */
  async getReportByMajor(majorName: string) {
    const report = await this.repo.findOne({
      where: { majorName },
      order: { createdAt: 'DESC' },
    })
    if (!report) throw new Error(`「${majorName}」暂无诊断报告`)
    return {
      id: report.id,
      majorName: report.majorName,
      year: report.year,
      title: report.title,
      markdown: report.markdown,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }
  }
}
