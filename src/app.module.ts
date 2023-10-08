import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    CoffeesModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/nest-coffees'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
