import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('industry_chain_node_enterprises')
export class IndustryChainNodeEnterprise {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  nodeId: string

  @Column({ type: 'uuid', nullable: true })
  enterpriseId: string | null

  @Column({ type: 'varchar', length: 200 })
  enterpriseNameRaw: string

  @Column({ type: 'varchar', length: 500 })
  mappingPathRaw: string

  @Column({ type: 'varchar', length: 20, default: 'list' })
  sourceType: string

  @Column({ type: 'boolean', default: false })
  isDeepProfile: boolean

  @Column({ type: 'boolean', default: true })
  isCounted: boolean

  @Column({ type: 'varchar', length: 20, default: 'name_only' })
  matchStatus: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  enterpriseCategoryRaw: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  areaRaw: string | null

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ratingRaw: number | null

  @Column({ type: 'jsonb', nullable: true })
  sourceSnapshot: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
