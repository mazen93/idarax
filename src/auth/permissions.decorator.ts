import { SetMetadata } from '@nestjs/common';
import { ActionType } from './permissions.constants';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: ActionType[]) => SetMetadata(PERMISSIONS_KEY, permissions);
