import { ActionType } from './permissions.constants';
export declare const PERMISSIONS_KEY = "permissions";
export declare const Permissions: (...permissions: ActionType[]) => import("@nestjs/common").CustomDecorator<string>;
