import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * 产教适配可视化分析报告
 * 数据源：现代纺织技术能力图谱构建报告 + 现代纺织技术人培方案诊断报告
 */
@Entity('industry_edu_adaptation_reports')
export class IndustryEduAdaptationReport {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 200, default: '' })
  title: string

  @Column({ type: 'jsonb', nullable: true })
  eduJobComparison: any

  @Column({ type: 'jsonb', nullable: true })
  courseMatrix: any

  @Column({ type: 'jsonb', nullable: true })
  domainAnalysis: any

  @Column({ type: 'jsonb', nullable: true })
  overallAssessment: any

  @Column({ type: 'jsonb', nullable: true })
  patentEnterpriseMatching: any

  @Column({ type: 'jsonb', nullable: true })
  topEnterprises: any

  @Column({ type: 'jsonb', nullable: true })
  techCourseMapping: any

  @Column({ type: 'varchar', length: 50, default: 'md_import' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
