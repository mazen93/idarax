import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
export declare const CHECK_FEATURE = "check_feature";
export declare const Feature: (feature: string) => import("@nestjs/common").CustomDecorator<string>;
export declare class FeatureGateGuard implements CanActivate {
    private reflector;
    private prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
