"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BloodDonarForm_1 = require("../Controllers/BloodDonarSide/BloodDonarForm");
const TryCatch_1 = require("../Utils/TryCatch");
const router = express_1.default.Router();
router.post("/donors", (0, TryCatch_1.trycatch)(BloodDonarForm_1.createDonor));
router.get("/donors", (0, TryCatch_1.trycatch)(BloodDonarForm_1.getDonors));
router.get("/donors/:id", (0, TryCatch_1.trycatch)(BloodDonarForm_1.getSingleDonor));
router.get("/donors/users/:id", (0, TryCatch_1.trycatch)(BloodDonarForm_1.getDonorId));
router.put("/donors/:id", (0, TryCatch_1.trycatch)(BloodDonarForm_1.updateDonor));
router.delete("/donors/:id", (0, TryCatch_1.trycatch)(BloodDonarForm_1.deleteDonor));
exports.default = router;
//# sourceMappingURL=BloodDonarRoutes.js.map