import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

/**
 * 院校专业画像（来自网站 index.html 的 D.profiles[]）
 * 用于“对口院校供给”的稳定查询与展示。
 */
@Entity('edu_major_profiles')
@Index('IDX_edu_major_profiles_school_major', ['school', 'major'])
export class EduMajorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 200 })
  school: string

  @Column({ type: 'varchar', length: 200 })
  major: string

  @Column({ type: 'varchar', length: 200, nullable: true })
  group: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  bucket: string | null

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]

  // 2025 年招生/供给规模
  @Column({ type: 'int', nullable: true })
  supply25: number

  @Column({ type: 'text', nullable: true })
  goal: string

  @Column({ type: 'jsonb', nullable: true })
  courses: string[]

  @Column({ type: 'jsonb', nullable: true })
  skills: string[]

  @Column({ type: 'jsonb', nullable: true })
  certs: string[]

  @Column({ type: 'text', nullable: true })
  labs: string

  @Column({ type: 'text', nullable: true })
  coop: string

  @Column({ type: 'text', nullable: true })
  research: string

  @Column({ type: 'text', nullable: true })
  jobs: string

  @Column({ type: 'jsonb', nullable: true })
  strongCos: string[]

  // 原始来源对象，便于后续补字段/排障
  @Column({ type: 'jsonb', nullable: true })
  sourceJson: any

  @Column({ type: 'varchar', length: 50, default: 'website_index' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
