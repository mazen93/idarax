import { SetMetadata } from '@nestjs/common';

export const FEATURES_KEY = 'features';
export const RequiresFeature = (feature: string) => SetMetadata(FEATURES_KEY, feature);
