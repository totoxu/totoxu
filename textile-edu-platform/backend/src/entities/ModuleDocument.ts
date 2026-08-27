import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

/**
 * 模块文档（pdf/word 等，供在线查看与下载）
 */
@Entity('module_documents')
@Index('IDX_module_docs_module', ['module'])
export class ModuleDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // 所属模块，如 专业诊断报告
  @Column({ type: 'varchar', length: 100, default: '专业诊断报告' })
  module: string

  // 关联专业（可选）
  @Column({ type: 'varchar', length: 200, default: '' })
  majorName: string

  @Column({ type: 'varchar', length: 300 })
  name: string

  // 磁盘存储文件名
  @Column({ type: 'varchar', length: 300 })
  storedName: string

  @Column({ type: 'varchar', length: 50 })
  fileType: string

  @Column({ type: 'int', default: 0 })
  size: number

  @Column({ type: 'varchar', length: 100, default: '' })
  uploader: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
