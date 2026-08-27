import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * 典型岗位职业能力与课程映射图谱数据（来自 dist_web_publish/parsed_jobs_data.js 的 jobsData）
 * data 结构：{ positions: { [岗位名]: { tasks: [], sankeyLinks: [] } } }
 */
@Entity('job_competency_reports')
export class JobCompetencyReport {
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
