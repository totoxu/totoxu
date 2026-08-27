import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * 技术前沿分析-总览数据（来自 dist_web_publish/patent_dashboard_data.js 的 patentDashboardData）
 * 包含：school_info / nantong_hot_techs / sankey_links / major_mapping_analysis
 */
@Entity('tech_overview_reports')
export class TechOverviewReport {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 200, default: '' })
  schoolName: string

  // 完整总览数据
  @Column({ type: 'jsonb' })
  data: any

  @Column({ type: 'varchar', length: 50, default: 'dist_web_publish' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
