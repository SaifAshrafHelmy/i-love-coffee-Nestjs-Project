import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Coffee, CoffeeDocument } from './entities/coffee.entity';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name) private coffeeModel: Model<Coffee>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return await this.coffeeModel.find().skip(offset).limit(limit);
  }

  async findOne(id: string) {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) throw new NotFoundException('Invalid Object Id');

    const coffee = await this.coffeeModel.findById(id);
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const newCoffee = new this.coffeeModel(createCoffeeDto);
    return await newCoffee.save();
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) throw new NotFoundException('Invalid Object Id');

    const existingCoffee = await this.coffeeModel.findByIdAndUpdate(
      id,
      updateCoffeeDto,
      { new: true },
    );
    if (existingCoffee) {
      return existingCoffee;
    } else {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
  }

  async remove(id: string) {
    const existingCoffee = await this.coffeeModel.findByIdAndRemove(id);
    if (existingCoffee) {
      return 'Successfully Deleted';
    } else {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
  }
  async recommendCoffee(coffeeId: string) {
    const session = await this.connection.startSession();
    const coffee = await this.findOne(coffeeId);

    session.startTransaction();
    try {
      // update Coffee
      coffee.recommendations++;
      coffee.save({ session });
      // Update Event
      const newEvent = new this.eventModel({
        type: 'coffee',
        name: 'recommend_coffee',
        payload: { coffeeId: coffeeId },
      });
      newEvent.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new BadRequestException('failed to recommended coffee');
    } finally {
      await session.endSession();
    }
    return 'successfully recommended coffee';
  }
}
