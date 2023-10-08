import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CoffeeDocument = HydratedDocument<Coffee>;
/* 
The type HydratedDocument<entity> is a TypeScript type that represents a Mongoose document that has been hydrated with data from the database. This means that all of the document's properties have been populated with values.
 This can help to prevent errors, such as trying to access a property on a document that has not yet been hydrated.
*/

@Schema()
export class Coffee {
  @Prop({ index: true })
  name: string;

  @Prop()
  brand: string;

  @Prop([String])
  flavors: string[];

  @Prop({ default: 0 })
  recommendations: number;
}
export const CoffeeSchema = SchemaFactory.createForClass(Coffee);

// for compound indexes:
// 1 means ASC Order, -1 means DESC Order
CoffeeSchema.index({ name: 1, brand: -1 });
