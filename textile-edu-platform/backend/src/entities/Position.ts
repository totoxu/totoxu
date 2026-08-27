import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'jsonb', nullable: true })
  abilityModel: any

  @Column({ type: 'jsonb', nullable: true })
  responsibilities: any

  @Column({ type: 'jsonb', nullable: true })
  certificates: any

  @Column({ type: 'int', default: 0 })
  demandCount: number

  @Column({ type: 'varchar', length: 50, nullable: true })
  averageSalary: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
