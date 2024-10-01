import { Module } from '@nestjs/common';
import { MainRepo } from './main.repo';

@Module({
  providers: [MainRepo],
  exports: [MainRepo],
})
export class RepoModule {}
