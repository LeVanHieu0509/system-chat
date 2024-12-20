import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RepoModule } from '@app/repositories/repo.module';

@Module({
  imports: [RepoModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
