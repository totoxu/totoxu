import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // 基本信息
  @Column({ type: 'varchar', length: 200 })
  name: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string

  @Column({ type: 'boolean', default: true })
  found: boolean

  // 基础工商信息
  @Column({ type: 'varchar', length: 100, nullable: true })
  legalRep: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  regCapital: string

  @Column({ type: 'date', nullable: true })
  founded: Date

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  staffSize: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'varchar', length: 200, nullable: true })
  industry: string

  @Column({ type: 'text', nullable: true })
  scopeBrief: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyType: string

  // 人员信息（JSON）
  @Column({ type: 'jsonb', nullable: true })
  personnel: any[]

  // 参保趋势（JSON）
  @Column({ type: 'jsonb', nullable: true })
  insuredTrend: any[]

  // 专利信息
  @Column({ type: 'int', default: 0 })
  patentsTotal: number

  @Column({ type: 'int', default: 0 })
  patentsInvention: number

  @Column({ type: 'int', default: 0 })
  patentsUtility: number

  @Column({ type: 'int', default: 0 })
  patentsDesign: number

  @Column({ type: 'int', default: 0 })
  patentsRecent3y: number

  @Column({ type: 'jsonb', nullable: true })
  patentsKeyDirs: string[]

  // 软著数量
  @Column({ type: 'int', default: 0 })
  softwareCopyrights: number

  // 招聘信息（JSON）
  @Column({ type: 'jsonb', nullable: true })
  recruitment: any

  // 荣誉（JSON数组）
  @Column({ type: 'jsonb', nullable: true })
  honors: string[]

  // 风险信息（JSON）
  @Column({ type: 'jsonb', nullable: true })
  risks: any

  // 分支机构
  @Column({ type: 'jsonb', nullable: true })
  branches: string[]

  // 财务信息（JSON）
  @Column({ type: 'jsonb', nullable: true })
  financial: any

  // 网络信息备注
  @Column({ type: 'text', nullable: true })
  webNotes: string

  // 分析报告（JSON）
  @Column({ type: 'jsonb', nullable: true })
  analysis: any

  // 招投标信息（JSON）
  @Column({ type: 'jsonb', nullable: true })
  tenders: any

  // 站点原始画像（用于“完全复刻”单文件网站的企业画像内容）
  // 说明：该字段保存从 `网站/index.html` 的 SITE_DATA.companies 中提取的原始对象，便于前端按原口径渲染
  @Column({ type: 'jsonb', nullable: true })
  siteProfile: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
