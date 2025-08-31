"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LabFrorm_1 = require("../Controllers/LabSide/LabFrorm");
const TryCatch_1 = require("../Utils/TryCatch");
const router = express_1.default.Router();
router.post("/lab", (0, TryCatch_1.trycatch)(LabFrorm_1.createLab));
router.get("/lab", (0, TryCatch_1.trycatch)(LabFrorm_1.getLabs));
router.get("/lab/:id", (0, TryCatch_1.trycatch)(LabFrorm_1.getSingleLab));
router.put("/lab/:id", (0, TryCatch_1.trycatch)(LabFrorm_1.updateLab));
router.delete("/lab/:id", (0, TryCatch_1.trycatch)(LabFrorm_1.deleteLab));
exports.default = router;
//# sourceMappingURL=LabRoutes.js.map