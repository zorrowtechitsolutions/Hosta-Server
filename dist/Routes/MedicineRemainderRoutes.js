"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MedicineRemainderForm_1 = require("../Controllers/MedicineRemainderSide/MedicineRemainderForm");
const TryCatch_1 = require("../Utils/TryCatch");
const router = express_1.default.Router();
router.post("/medicines", (0, TryCatch_1.trycatch)(MedicineRemainderForm_1.createMedicine));
router.get("/medicines/:userId/users", (0, TryCatch_1.trycatch)(MedicineRemainderForm_1.getMedicines));
router.get("/medicines/:id", (0, TryCatch_1.trycatch)(MedicineRemainderForm_1.getSingleMedicine));
router.put("/medicines/:id", (0, TryCatch_1.trycatch)(MedicineRemainderForm_1.updateMedicine));
router.put("/medicines/:id/status", (0, TryCatch_1.trycatch)(MedicineRemainderForm_1.editMedicineStatus));
router.delete("/medicines/:id", (0, TryCatch_1.trycatch)(MedicineRemainderForm_1.deleteMedicine));
// router.get("/medicines/check-missed", trycatch( alaram ));
exports.default = router;
//# sourceMappingURL=MedicineRemainderRoutes.js.map