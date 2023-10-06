import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;
    return await this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id },
      relations: ['flavors'], // Specify the relation to be loaded
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await this.preloadFlavorByName(createCoffeeDto.flavors);
    const finalCoffee = { ...createCoffeeDto, flavors };
    const coffee = await this.coffeeRepository.create(finalCoffee);
    return this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    // if we update the flavors array, we get the flavors with result, and if we don't, we don't
    let finalCoffee;
    if (updateCoffeeDto.flavors) {
      const flavors = await this.preloadFlavorByName(updateCoffeeDto.flavors);
      finalCoffee = { ...updateCoffeeDto, flavors };
    } else {
      finalCoffee = updateCoffeeDto;
    }

    const coffee = await this.coffeeRepository.preload({
      id,
      ...finalCoffee,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    this.coffeeRepository.save(coffee);

    return this.findOne(id);
  }

  async remove(id: number) {
    const coffee = await this.coffeeRepository.findOneBy({ id });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.remove(coffee);
  }

  private async preloadFlavorByName(flavors: string[]) {
    const flavorInstances = await Promise.all(
      flavors.map(async (name) => {
        const existingFlavor = await this.flavorRepository.findOne({
          where: { name },
        });
        if (existingFlavor) {
          return existingFlavor;
        } else {
          return this.flavorRepository.create({ name });
        }
      }),
    );
    return flavorInstances;
  }

  // Deleted private keyword
  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
