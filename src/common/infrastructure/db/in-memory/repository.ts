import { CommonEntity } from 'src/common/domain/entity'
import { CommonRepository } from 'src/common/domain/repository'

export abstract class CommonInMemoryRepository<
  DomainEntity extends CommonEntity,
  CreateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
  UpdateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
  Entity extends DomainEntity = DomainEntity,
> implements CommonRepository<DomainEntity, CreateDomainEntityInput, UpdateDomainEntityInput>
{
  private entities = new Map<string, Entity>()

  constructor(
    protected readonly generate: (input: CreateDomainEntityInput) => Entity,
    protected readonly serialize: (entity: DomainEntity) => Entity,
    protected readonly deserialize: (entity: Entity) => DomainEntity = (entity) => entity,
  ) {}

  async findAll(): Promise<DomainEntity[]> {
    const entities = [...this.entities.values()]
    return entities.map((entity) => this.deserialize(entity))
  }

  async findById(id: string): Promise<DomainEntity | null> {
    const entity = this.entities.get(id)
    return entity ? this.deserialize(entity) : null
  }

  async createOne(entity: CreateDomainEntityInput): Promise<DomainEntity> {
    const createdTask = this.generate(entity)
    this.entities.set(createdTask.id, createdTask)
    return this.deserialize(createdTask)
  }

  async updateOne(id: string, changes: UpdateDomainEntityInput): Promise<DomainEntity | null> {
    const task = await this.findById(id)
    if (!task) {
      return null
    }
    const nextTask = this.serialize({
      ...task,
      ...changes,
      updatedAt: new Date(),
    })
    this.entities.set(id, nextTask)
    const updatedTask = await this.findById(task.id)
    return updatedTask!
  }

  async deleteOne(id: string): Promise<boolean> {
    return this.entities.delete(id)
  }
}
