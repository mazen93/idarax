"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiresFeature = exports.FEATURES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.FEATURES_KEY = 'features';
const RequiresFeature = (feature) => (0, common_1.SetMetadata)(exports.FEATURES_KEY, feature);
exports.RequiresFeature = RequiresFeature;
//# sourceMappingURL=subscription.decorator.js.map