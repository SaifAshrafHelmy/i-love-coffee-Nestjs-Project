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
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private checkValidMongooseId(id: string): void {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) throw new NotFoundException('Invalid Object Id');
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<CoffeeDocument[]> {
    const { limit, offset } = paginationQuery;
    return await this.coffeeModel.find().skip(offset).limit(limit);
  }

  async findOne(id: string): Promise<CoffeeDocument> {
    this.checkValidMongooseId(id);

    const coffee = await this.coffeeModel.findById(id);
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<CoffeeDocument> {
    const newCoffee = new this.coffeeModel(createCoffeeDto);
    return await newCoffee.save();
  }

  async update(
    id: string,
    updateCoffeeDto: UpdateCoffeeDto,
  ): Promise<CoffeeDocument> {
    this.checkValidMongooseId(id);

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

  async remove(id: string): Promise<string> {
    const existingCoffee = await this.coffeeModel.findByIdAndRemove(id);
    if (existingCoffee) {
      return 'Successfully Deleted';
    } else {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
  }

  async recommendCoffee(coffeeId: string) {
    console.log("I'm in");
    const coffee = await this.findOne(coffeeId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      console.log('inside the try');
      coffee.recommendations++;

      // console.log(coffee);

      const recommendEvent = await new this.eventModel({
        type: 'coffee',
        name: 'recommend_coffee',
        payload: { coffeeId: coffeeId },
      });

      // console.log(recommendEvent);
      // console.log(coffee);
      console.log('at end of  the try');
      // console.log(coffee);

      // Validate the document before saving it
      const validationErrors = recommendEvent.validateSync();

      console.log('here it is: ', validationErrors);
      await recommendEvent.save({ session });

      await coffee.save({ session });
    } catch (err) {
      await session.abortTransaction();
      throw new BadRequestException('failed to recommended coffee');
    } finally {
      await session.endSession();
    }
    return 'successfully recommended coffee';
  }
}
