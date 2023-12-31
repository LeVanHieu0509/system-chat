import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { CatModule } from './models/cat/cats.module';
import { AlgorithmModule } from './algrorithorm/algorithm.module';

@Module({
  imports: [
    AlgorithmModule,
    CatModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
