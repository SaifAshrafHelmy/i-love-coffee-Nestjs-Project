import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CoffeesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'pass123',
      database: 'nest-coffees',
      // database = DB name
      autoLoadEntities: true,
      // helps load the modules automatically instead of specifying the entities array
      synchronize: true,
      // To sync TypeORM entities with the database every time we run our app
      // lets typeORM automatically generate the SQL table from all classes with the @Entity() decorator and the metadata they contain.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
