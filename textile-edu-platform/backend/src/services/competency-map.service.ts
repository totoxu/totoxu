import { AppDataSource } from '../config/database'
import { CompetencyMapReport } from '../entities/CompetencyMapReport'
import { PositionAnalysisReport } from '../entities/PositionAnalysisReport'
import { JobCompetencyReport } from '../entities/JobCompetencyReport'

export class CompetencyMapService {
  private repo = AppDataSource.getRepository(CompetencyMapReport)
  private analysisRepo = AppDataSource.getRepository(PositionAnalysisReport)
  private jobCompetencyRepo = AppDataSource.getRepository(JobCompetencyReport)

  /**
   * 获取关键岗位能力图谱（桑基节点 + 链路 + 能力画像明细）。
   */
  async getMap() {
    const report = await this.repo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    })

    if (!report.length) {
      throw new Error('关键岗位能力图谱数据不存在')
    }

    const { nodes, links, details } = report[0].data || {}
    const detailNames = details && typeof details === 'object' ? Object.keys(details) : []

    return {
      nodes: nodes || [],
      links: links || [],
      detailNames,
    }
  }

  /**
   * 获取某个岗位的能力画像详情。
   */
  async getPositionDetail(name: string) {
    const report = await this.repo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    })

    if (!report.length) {
      throw new Error('关键岗位能力图谱数据不存在')
    }

    const details = report[0].data?.details || {}
    const detail = details[name]

    if (!detail) {
      throw new Error(`未找到岗位「${name}」的能力画像`)
    }

    return {
      name,
      profile: detail,
    }
  }

  /**
   * 关键岗位能力分析数据（analysisJobsData + occMajorNodes/Links）。
   */
  async getPositionAnalysis() {
    const report = await this.analysisRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    })

    if (!report.length) {
      throw new Error('关键岗位能力分析数据不存在')
    }

    const { jobs, occMajorNodes, occMajorLinks, occMajorTable } = report[0].data || {}
    return {
      jobs: jobs || [],
      occMajorNodes: occMajorNodes || [],
      occMajorLinks: occMajorLinks || [],
      occMajorTable: occMajorTable || [],
    }
  }

  /**
   * 典型岗位职业能力与课程映射图谱数据（jobsData：tasks + sankeyLinks）。
   */
  async getJobCompetency() {
    const report = await this.jobCompetencyRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    })

    if (!report.length) {
      throw new Error('典型岗位职业能力与课程映射图谱数据不存在')
    }

    const positions = report[0].data?.positions || {}
    return {
      positions,
      positionNames: Object.keys(positions),
    }
  }
}
