"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TryCatch_1 = require("../Utils/TryCatch");
const Commen_1 = require("../Controllers/Commen");
const Authenticator_1 = __importDefault(require("../Middlewares/Authenticator"));
const commenRoutes = express_1.default.Router();
commenRoutes.post("/email", (0, TryCatch_1.trycatch)(Commen_1.sendMail));
commenRoutes.get("/refresh", (0, TryCatch_1.trycatch)(Commen_1.Refresh));
commenRoutes.get("/logout", Authenticator_1.default, (0, TryCatch_1.trycatch)(Commen_1.Logout));
exports.default = commenRoutes;
//# sourceMappingURL=CommenRoute.js.map