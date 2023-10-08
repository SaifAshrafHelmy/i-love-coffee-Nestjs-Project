import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Event {
  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop({ type: mongoose.SchemaTypes.Mixed })
  payload: Record<string, any>;
}

export const eventSchema = SchemaFactory.createForClass(Event);
