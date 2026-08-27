import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

/**
 * 专业诊断报告（人培方案诊断报告）
 */
@Entity('diagnostic_reports')
@Index('IDX_diag_report_major_year', ['majorName', 'year'])
export class DiagnosticReport {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 200 })
  majorName: string

  @Column({ type: 'varchar', length: 20, default: '2025' })
  year: string

  @Column({ type: 'varchar', length: 300, default: '' })
  title: string

  // 报告 Markdown 全文
  @Column({ type: 'text' })
  markdown: string

  @Column({ type: 'varchar', length: 50, default: 'manual_import' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
