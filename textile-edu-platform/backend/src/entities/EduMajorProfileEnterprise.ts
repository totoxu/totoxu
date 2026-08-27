import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

/**
 * 专业-企业强对口映射（来自 profiles[].strongCos[]）
 * 用于“某企业 -> 对口院校专业供给”的反查。
 */
@Entity('edu_major_profile_enterprises')
@Index('IDX_edu_mp_enterprise_id', ['enterpriseId'])
@Index('IDX_edu_mp_profile_id', ['profileId'])
export class EduMajorProfileEnterprise {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  profileId: string

  // 能匹配到 enterprises 主表时写入
  @Column({ type: 'uuid', nullable: true })
  enterpriseId: string | null

  @Column({ type: 'varchar', length: 300 })
  enterpriseNameRaw: string

  // 规范化后的企业名称（去括号/空格/符号），便于匹配与检索
  @Column({ type: 'varchar', length: 300, nullable: true })
  enterpriseNameNorm: string | null

  @Column({ type: 'varchar', length: 30, default: 'unmatched' })
  matchStatus: string

  @Column({ type: 'varchar', length: 30, nullable: true })
  matchMethod: string | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
