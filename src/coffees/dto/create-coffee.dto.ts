/* eslint-disable prettier/prettier */
import { IsOptional, IsString } from 'class-validator';

export class CreateCoffeeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly brand: string;

  @IsString({ each: true })
  @IsOptional()
  readonly flavors: string[];
}
