import { CommonEntity } from './entity'

export interface CommonRepository<
  DomainEntity extends CommonEntity,
  CreateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
  UpdateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
> {
  findAll(): Promise<DomainEntity[]>
  findById(id: string): Promise<DomainEntity | null>
  createOne(task: CreateDomainEntityInput): Promise<DomainEntity>
  updateOne(id: string, changes: UpdateDomainEntityInput): Promise<DomainEntity | null>
  /**
   * @returns true if an element existed and has been removed, or false if the element does not exist.
   */
  deleteOne(id: string): Promise<boolean>
  deleteAll(): Promise<void>
}
