"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const GoogleAuth_1 = require("../Controllers/UserSide/GoogleAuth");
const TryCatch_1 = require("../Utils/TryCatch");
const router = express_1.default.Router();
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/" }), (0, TryCatch_1.trycatch)(GoogleAuth_1.googleCallbackHandler));
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map