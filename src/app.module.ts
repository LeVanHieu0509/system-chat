import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { ItemController } from './item/item.controller';
import { ItemService } from './item/item.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig())
  ],
  controllers: [AppController, ItemController],
  providers: [AppService, ItemService],
})
export class AppModule { }