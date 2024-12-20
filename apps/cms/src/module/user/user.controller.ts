import {
  MainValidationPipe,
  PATH_CONTAIN_ID,
  Roles,
  RoleType,
} from '@app/common';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AdminResetPasswordRequestDto,
  RegisterUserRequestDto,
  UserQuerySearchDto,
  UserRequestDto,
} from './user.dto';
import { UserService } from './user.service';
import { AuthUser, RequestUser } from '../../dto';

@Controller('user')
export class UserController {
  constructor(private readonly _service: UserService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Get()
  async getUsers(@Query() query: UserQuerySearchDto) {
    return this._service.getAllUser(query);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID)
  async getUserById(@Param('id') id: string) {
    return this._service.getUserById(id);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post()
  async createUser(
    @Body() body: RegisterUserRequestDto,
    @Req() { user }: RequestUser,
  ) {
    return this._service.createUser(body, user as AuthUser);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch(PATH_CONTAIN_ID)
  async editUser(
    @Body() body: UserRequestDto,
    @Req() { user }: RequestUser,
    @Param('id') id: string,
  ) {
    return this._service.editUser(id, body, user as AuthUser);
  }

  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post(PATH_CONTAIN_ID + '/reset-password')
  async resetPassword(
    @Body() body: AdminResetPasswordRequestDto,
    @Param('id') id: string,
  ) {
    return this._service.resetPassword(body, id);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Delete(PATH_CONTAIN_ID)
  async deleteUser(@Param('id') id: string, @Req() { user }: RequestUser) {
    if (id === (user as AuthUser).id) {
      throw new BadRequestException([
        { field: 'id', message: 'Can not delete yourself' },
      ]);
    }

    return this._service.deleteUser(id, user as AuthUser);
  }
}
