"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserForm_1 = require("../Controllers/UserSide/UserForm");
const TryCatch_1 = require("../Utils/TryCatch");
const Authenticator_1 = __importDefault(require("../Middlewares/Authenticator"));
const userRoutes = express_1.default.Router();
userRoutes.post("/users/registeration", (0, TryCatch_1.trycatch)(UserForm_1.userRegister));
userRoutes.post("/users/login", (0, TryCatch_1.trycatch)(UserForm_1.userLogin));
userRoutes.post("/users/login/phone", (0, TryCatch_1.trycatch)(UserForm_1.login));
userRoutes.post("/users/password", Authenticator_1.default, (0, TryCatch_1.trycatch)(UserForm_1.resetPassword));
userRoutes.get("/users", Authenticator_1.default, (0, TryCatch_1.trycatch)(UserForm_1.userData));
userRoutes.get("/hospitals", (0, TryCatch_1.trycatch)(UserForm_1.getHospitals));
userRoutes.post("/reviews/:id", Authenticator_1.default, (0, TryCatch_1.trycatch)(UserForm_1.postReview));
userRoutes.put("/reviews/:hospital_id/:reviewId", Authenticator_1.default, (0, TryCatch_1.trycatch)(UserForm_1.editReview));
userRoutes.delete("/reviews/:hospital_id/:reviewId", Authenticator_1.default, (0, TryCatch_1.trycatch)(UserForm_1.deleteReview));
userRoutes.post("/users/otp", (0, TryCatch_1.trycatch)(UserForm_1.verifyOtp));
exports.default = userRoutes;
//# sourceMappingURL=UserRoutes.js.map