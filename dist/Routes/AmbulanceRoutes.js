"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TryCatch_1 = require("../Utils/TryCatch");
const AmbulaceForm_1 = require("../Controllers/AmbulanceSide/AmbulaceForm");
const AmbulanceRoutes = express_1.default.Router();
AmbulanceRoutes.post("/ambulance/register", (0, TryCatch_1.trycatch)(AmbulaceForm_1.Registeration));
AmbulanceRoutes.post("/ambulance/login", (0, TryCatch_1.trycatch)(AmbulaceForm_1.login));
AmbulanceRoutes.get("/ambulance", (0, TryCatch_1.trycatch)(AmbulaceForm_1.getanAmbulace));
AmbulanceRoutes.get("/ambulances", (0, TryCatch_1.trycatch)(AmbulaceForm_1.getAmbulaces));
AmbulanceRoutes.put("/ambulance/:id", (0, TryCatch_1.trycatch)(AmbulaceForm_1.updateData));
AmbulanceRoutes.delete("/ambulance/:id", (0, TryCatch_1.trycatch)(AmbulaceForm_1.ambulanceDelete));
exports.default = AmbulanceRoutes;
//# sourceMappingURL=AmbulanceRoutes.js.map