import { CommonEntity } from 'src/common/domain/entity'
import { CommonRepository } from 'src/common/domain/repository'
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

export abstract class CommonPostgresRepository<
  DomainEntity extends CommonEntity,
  CreateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
  UpdateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
  Entity extends DomainEntity = DomainEntity,
> implements CommonRepository<DomainEntity, CreateDomainEntityInput, UpdateDomainEntityInput>
{
  constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly deserialize: (entity: Entity) => DomainEntity = (entity) => entity,
  ) {}

  async findAll(): Promise<DomainEntity[]> {
    const entities = await this.repository.find()
    return entities.map((entity) => this.deserialize(entity))
  }

  async findById(id: string): Promise<DomainEntity | null> {
    const entity = await this.repository.findOneBy(this.byId(id))
    return entity ? this.deserialize(entity) : null
  }

  async createOne(entity: CreateDomainEntityInput): Promise<DomainEntity> {
    const createdEntity = this.repository.create(entity as unknown as DeepPartial<Entity>) // TODO: fix typecast
    const savedEntity = await this.repository.save(createdEntity)
    return this.deserialize(savedEntity)
  }

  async updateOne(id: string, changes: UpdateDomainEntityInput): Promise<DomainEntity | null> {
    const { affected } = await this.repository.update(this.byId(id), changes as QueryDeepPartialEntity<Entity>) // TODO: fix typecast
    if (affected) {
      return await this.findById(id)
    }
    return null
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.repository.delete(this.byId(id))
    return !!result.affected
  }

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll()
  }

  private byId(id: string) {
    return { id } as FindOptionsWhere<Entity> // TODO: fix typecast
  }
}
