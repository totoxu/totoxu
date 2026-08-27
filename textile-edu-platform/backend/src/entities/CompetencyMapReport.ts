import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * 关键岗位能力图谱数据（来自 dist_web_publish/data.js）
 * data 结构：{ nodes: sankeyNodes[], links: sankeyLinks[], details: Record<岗位名, 能力画像> }
 */
@Entity('competency_map_reports')
export class CompetencyMapReport {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 200, default: '' })
  title: string

  // 完整图谱数据
  @Column({ type: 'jsonb' })
  data: any

  @Column({ type: 'varchar', length: 50, default: 'dist_web_publish' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
