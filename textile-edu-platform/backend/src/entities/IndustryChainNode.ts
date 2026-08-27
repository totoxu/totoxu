import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('industry_chain_nodes')
export class IndustryChainNode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'int' })
  level: number

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null

  @Column({ type: 'varchar', length: 100 })
  rootName: string

  @Column({ type: 'varchar', length: 200 })
  rawName: string

  @Column({ type: 'varchar', length: 200 })
  normalizedName: string

  @Column({ type: 'varchar', length: 500, unique: true })
  fullPath: string

  @Column({ type: 'varchar', length: 200 })
  displayName: string

  @Column({ type: 'int', default: 0 })
  displayOrder: number

  @Column({ type: 'varchar', length: 30, nullable: true })
  colorTag: string | null

  @Column({ type: 'boolean', default: true })
  isClickable: boolean

  @Column({ type: 'boolean', default: false })
  isLeafDisplayOnly: boolean

  @Column({ type: 'varchar', length: 50, default: 'website_index' })
  source: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
