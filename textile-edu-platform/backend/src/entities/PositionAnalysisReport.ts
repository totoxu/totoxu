import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * 关键岗位能力分析数据（来自 dist_web_publish/data.js 的 analysisJobsData + occ_major_data.js）
 * data 结构：{ jobs: analysisJobsData[], occMajorNodes: [], occMajorLinks: [] }
 */
@Entity('position_analysis_reports')
export class PositionAnalysisReport {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 200, default: '' })
  title: string

  @Column({ type: 'jsonb' })
  data: any

  @Column({ type: 'varchar', length: 50, default: 'dist_web_publish' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
