import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class CoffeesService {
  constructor(@InjectModel(Coffee.name) private coffeeModel: Model<Coffee>) {}

  async findAll() {
    return await this.coffeeModel.find();
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
}
