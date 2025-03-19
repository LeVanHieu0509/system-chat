import { CachingService } from '@app/caching';
import { STATUS } from '@app/common';
import { UtilsService } from '@app/utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PasswordRequestDto } from '../user/user.dto';
import { ResetPasswordRequestDto, UserProfileRequestDto } from './auth.dto';
import { MainRepo } from '@app/repositories/main.repo';
import { MailService } from '@app/mail';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger('AuthService');
  constructor(private readonly _repo: MainRepo) {
    _repo.setServiceName('CMS');
  }

  async signIn(username: string, password: string) {
    const user = await this._repo.getUser().findFirst({
      where: { userName: username, status: STATUS.ACTIVE, deletedAt: null },
      select: {
        id: true,
        password: true,
        role: true,
        phone: true,
        fullName: true,
        email: true,
      },
    });
    this._logger.log(`signIn user: ${JSON.stringify(user)}`);
    if (
      user
      // && UtilsService.getInstance().compareHash(password, user.password)
    ) {
      return user;
    }
    return null;
  }

  async processForgot(email: string) {
    const exist = await this._repo.getUser().count({
      where: { email, status: STATUS.ACTIVE, deletedAt: null },
    });
    if (exist === 1) {
      const token = UtilsService.getInstance().randomToken(24);
      CachingService.getInstance().set(email, token, 24 * 60 * 60);
      MailService.getInstance().sendForgotPass(email, token);
      return { status: true };
    }
    throw new BadRequestException([
      { field: 'email', message: 'Account haven’t finished setup yet' },
    ]);
  }

  async processCheckToken(email: string, token: string) {
    this._logger.log(`processCheckToken email: ${email} token: ${token}`);
    const cache = await CachingService.getInstance().get(email);
    if (cache && cache === token) {
      return { status: true };
    }
    throw new BadRequestException([
      { field: 'token', message: 'Token not valid' },
    ]);
  }

  async processResetPassword(input: ResetPasswordRequestDto) {
    this._logger.log(`processResetPassword input: ${JSON.stringify(input)}`);

    const { email, password, token } = input;
    const cache = await CachingService.getInstance().get<string>(email);
    if (cache && cache === token) {
      CachingService.getInstance().delete(email);
      return this._repo.getUser().update({
        where: { email },
        data: { password: UtilsService.getInstance().hashValue(password) },
        select: { id: true, role: true },
      });
    }
    return null;
  }

  async getProfile(id: string) {
    return this._repo.getUser().findFirst({
      where: { id },
      select: {
        id: true,
        userName: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async editProfile(
    input: UserProfileRequestDto | PasswordRequestDto,
    id: string,
  ) {
    this._logger.log(`editProfile id: ${id} input: ${JSON.stringify(input)}`);
    let password = (input as PasswordRequestDto).password;
    if (password) password = UtilsService.getInstance().hashValue(password);

    const output = await this._repo.getUser().update({
      where: { id },
      data: { ...input, password },
      select: { updatedAt: true },
    });

    if (password) {
      delete (input as PasswordRequestDto).password;
      CachingService.getInstance().delete(id.toString());
    }
    return output ? { id, ...input, updatedAt: output.updatedAt } : {};
  }
}
