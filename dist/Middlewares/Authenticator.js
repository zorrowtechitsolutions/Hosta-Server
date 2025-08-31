"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new http_errors_1.default.Unauthorized("No token provided. Please login.");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            throw new http_errors_1.default.Unauthorized("Invalid token. Please login.");
        }
        next();
    }
    catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return next(new http_errors_1.default.Unauthorized("Invalid or expired token."));
        }
        next(err);
    }
};
exports.default = Auth;
//# sourceMappingURL=Authenticator.js.map