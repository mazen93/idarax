import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenBlacklistService } from './token-blacklist.service';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    AuditLogModule,
  ],
  providers: [AuthService, JwtStrategy, TokenBlacklistService, SessionService],
  controllers: [AuthController, SessionController],
  exports: [TokenBlacklistService, SessionService],
})
export class AuthModule { }
