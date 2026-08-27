import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * 技术前沿分析报告（来自 dist_web_publish/index.html 的 techFrontierData.modern_textile）
 * 整份报告以 JSON 保存，前端按原站三面板结构渲染。
 */
@Entity('tech_frontier_reports')
export class TechFrontierReport {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // 专业唯一键，如 modern_textile
  @Column({ type: 'varchar', length: 100, unique: true })
  majorKey: string

  @Column({ type: 'varchar', length: 200 })
  majorName: string

  @Column({ type: 'varchar', length: 50, default: '江苏' })
  region: string

  @Column({ type: 'jsonb', nullable: true })
  years: number[]

  // 完整报告数据（hotspot_coverage / new_directions / course_module_suggestions / partner_companies / co_innovation_map / industry_institute_candidates / hotspot_course_map 等）
  @Column({ type: 'jsonb' })
  data: any

  @Column({ type: 'varchar', length: 50, default: 'dist_web_publish' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
