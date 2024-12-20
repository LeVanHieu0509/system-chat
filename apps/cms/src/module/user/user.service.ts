import { AppError, RoleType, STATUS } from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';

import { UtilsService } from '@app/utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CMS_DEFAULT_PASSWORD } from 'libs/config';
import { AuthUser } from '../../dto';
import {
  AdminResetPasswordRequestDto,
  RegisterUserRequestDto,
  UserQuerySearchDto,
  UserRequestDto,
} from './user.dto';
import { MainRepo } from '@app/repositories/main.repo';

@Injectable()
export class UserService {
  private _logger = new Logger('UserService');

  constructor(private readonly _repo: MainRepo) {
    _repo.setServiceName('CMS');
  }

  async getAllUser(query: UserQuerySearchDto) {
    this._logger.log(`getAllUser query: ${JSON.stringify(query)}`);

    const { page, size } = query;
    const { userName, fullName, role, status, createdBy, createdAt, keyword } =
      query;
    const pagination = this._repo.getPagination(page, size);

    const where = { deletedAt: null };
    if (userName)
      where['userName'] = { contains: userName, mode: 'insensitive' };
    if (fullName)
      where['fullName'] = { contains: fullName, mode: 'insensitive' };
    if (role || role === 0) where['role'] = role;
    if (status || status === 0) where['status'] = status;
    if (createdBy) where['createdBy'] = createdBy;
    if (keyword)
      where['OR'] = [
        { phone: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    if (createdAt) {
      const gte = new Date(createdAt);
      const lt = new Date(gte);
      lt.setDate(gte.getDate() + 1);
      where['createdAt'] = { gte, lt };
    }

    try {
      const [totalRecords, data] = await Promise.all([
        this._repo.getUser().count({ where }),
        this._repo.getUser().findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          select: {
            id: true,
            avatar: true,
            userName: true,
            fullName: true,
            email: true,
            role: true,
            phone: true,
            status: true,
            createdBy: true,
            createdAt: true,
          },
        }),
      ]);

      return { page: pagination.page, totalRecords, data };
    } catch (error) {
      console.log(`error.message`, error.message);
      return new AppError('ERR', 'Query filters not valid');
    }
  }

  async getUserById(id: string) {
    this._logger.log(`getUserById id: ${id}`);

    const output = await this._repo.getUser().findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        avatar: true,
        userName: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!output) {
      throw new BadRequestException({
        field: 'id',
        message: VALIDATE_MESSAGE.USER.USER_NOT_EXIST,
      });
    }
    let createBy = null;
    if (output.createdBy) {
      createBy = await this._repo
        .getUser()
        .findUnique({
          where: { id: output.createdBy },
          select: { id: true, fullName: true },
        });
    }
    return { ...output, createBy };
  }

  async createUser(input: RegisterUserRequestDto, user: AuthUser) {
    this._logger.log(`createUser input: ${JSON.stringify(input)}`);

    if (!checkRoleValid(user.role, input.role))
      throw new BadRequestException([
        { field: 'role', message: VALIDATE_MESSAGE.USER.ROLE_INVALID },
      ]);

    if (!input.role) input.role = RoleType.USER;

    if (
      await this._repo.getUser().count({ where: { userName: input.userName } })
    ) {
      throw new BadRequestException([
        { field: 'userName', message: VALIDATE_MESSAGE.USER.USER_EXIST },
      ]);
    }
    if (
      input.email &&
      (await this._repo.getUser().count({ where: { email: input.email } }))
    ) {
      throw new BadRequestException([
        { field: 'email', message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_EXIST },
      ]);
    }

    if (typeof input.status !== 'number') input.status = STATUS.ACTIVE;
    input.password = UtilsService.getInstance().hashValue(input.password);
    delete input['id'];

    const output = await this._repo.getUser().create({
      data: { ...input, createdBy: user.id },
      select: {
        id: true,
        userName: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const createBy = await this._repo
      .getUser()
      .findUnique({
        where: { id: user.id },
        select: { id: true, fullName: true },
      });
    return { ...output, createBy };
  }

  async editUser(id: string, body: UserRequestDto, user: AuthUser) {
    this._logger.log(`editUser id: ${id} body: ${JSON.stringify(body)}`);

    if (!checkRoleValid(user.role, body.role))
      throw new BadRequestException([
        { field: 'role', message: VALIDATE_MESSAGE.USER.ROLE_INVALID },
      ]);

    const userEdit = await this._repo
      .getUser()
      .findFirst({ where: { id, deletedAt: null }, select: { role: true } });
    if (!userEdit) {
      throw new BadRequestException([
        { field: 'id', message: VALIDATE_MESSAGE.USER.USER_NOT_EXIST },
      ]);
    } else if (!checkRoleValid(user.role, userEdit.role)) {
      throw new ForbiddenException(VALIDATE_MESSAGE.USER.ROLE_INVALID);
    }

    if (
      body.email &&
      (await this._repo.getUser().count({ where: { email: body.email } }))
    ) {
      throw new BadRequestException([
        { field: 'email', message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID },
      ]);
    }

    const { updatedAt } = await this._repo
      .getUser()
      .update({ where: { id }, data: body, select: { updatedAt: true } });
    return { id, ...body, updatedAt };
  }

  async resetPassword(input: AdminResetPasswordRequestDto, id: string) {
    this._logger.log(`resetPassword id: ${id} input: ${JSON.stringify(input)}`);

    const exist = await this._repo
      .getUser()
      .count({ where: { id, deletedAt: null } });
    if (exist === 1) {
      const password = input.password ? input.password : CMS_DEFAULT_PASSWORD;

      await this._repo.getUser().update({
        where: { id },
        data: { password: UtilsService.getInstance().hashValue(password) },
      });
      return { status: true };
    }
    throw new BadRequestException([
      { field: 'id', message: VALIDATE_MESSAGE.USER.USER_NOT_EXIST },
    ]);
  }

  async deleteUser(id: string, user: AuthUser) {
    this._logger.log(`deleteUser id: ${id}`);

    if (user.role !== RoleType.ADMIN) {
      const userDelete = await this._repo
        .getUser()
        .findFirst({ where: { id, deletedAt: null }, select: { role: true } });
      if (!userDelete) {
        throw new BadRequestException([
          { field: 'id', message: VALIDATE_MESSAGE.USER.USER_NOT_EXIST },
        ]);
      } else if (!checkRoleValid(user.role, userDelete.role)) {
        throw new ForbiddenException(VALIDATE_MESSAGE.USER.ROLE_INVALID);
      }
    }

    await this._repo
      .getUser()
      .update({ where: { id }, data: { deletedAt: new Date().toISOString() } });
    return { status: true };
  }
}

function checkRoleValid(userRole: number, bodyRole: number) {
  if (!bodyRole) return true;
  switch (userRole) {
    case RoleType.ADMIN:
      return true;
    case RoleType.MANAGER:
      return [RoleType.MANAGER, RoleType.EDITOR, RoleType.USER].includes(
        bodyRole,
      );
    case RoleType.EDITOR:
      return [RoleType.EDITOR, RoleType.USER].includes(bodyRole);
    case RoleType.USER:
      return RoleType.USER === bodyRole;
    default:
      return false;
  }
}
