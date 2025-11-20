import { HydratedDocument, Model } from 'mongoose'
import { CommonEntity } from 'src/common/domain/entity'
import { CommonRepository } from 'src/common/domain/repository'

export abstract class CommonMongoRepository<
  DomainEntity extends CommonEntity,
  CreateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
  UpdateDomainEntityInput extends Partial<DomainEntity> = Partial<DomainEntity>,
  Entity extends DomainEntity = DomainEntity,
> implements CommonRepository<DomainEntity, CreateDomainEntityInput, UpdateDomainEntityInput>
{
  constructor(
    protected readonly model: Model<Entity>,
    protected readonly deserialize: (entity: HydratedDocument<Entity>) => DomainEntity,
  ) {}

  async findAll(): Promise<DomainEntity[]> {
    const docs = await this.model.find().exec()
    return docs.map((doc) => this.deserialize(doc))
  }

  async findById(id: string): Promise<DomainEntity | null> {
    const doc = await this.model.findById(id).exec()
    return doc ? this.deserialize(doc) : null
  }

  async createOne(entity: CreateDomainEntityInput): Promise<DomainEntity> {
    const doc = await this.model.create(entity)
    return this.deserialize(doc)
  }

  async updateOne(id: string, changes: UpdateDomainEntityInput): Promise<DomainEntity | null> {
    if (!Object.keys(changes).length) {
      const current = await this.findById(id)
      return current
    }
    const doc = await this.model.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).exec()
    return doc ? this.deserialize(doc) : null
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec()
    return !!result
  }

  async deleteAll(): Promise<void> {
    await this.model.deleteMany().exec()
  }
}
