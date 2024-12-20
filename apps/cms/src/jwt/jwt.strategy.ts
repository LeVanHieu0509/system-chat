import { CachingService } from '@app/caching';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { CMS_JWT_SECRET_KEY } from 'libs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: CMS_JWT_SECRET_KEY
        });
    }

    async validate(payload: AuthUser): Promise<AuthUser> {
        const valid = await CachingService.getInstance().get('BITBACK_CMS' + payload.id);
        if (valid && payload['exp'] > payload['iat']) return payload;
        throw new UnauthorizedException();
    }
}
