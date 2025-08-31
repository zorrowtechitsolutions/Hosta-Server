"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trycatch = void 0;
const trycatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    }
    catch (error) {
        return next(error);
    }
};
exports.trycatch = trycatch;
//# sourceMappingURL=TryCatch.js.map