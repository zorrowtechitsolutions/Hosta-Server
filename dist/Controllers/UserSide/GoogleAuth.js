"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallbackHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema_1 = __importDefault(require("../../Model/UserSchema"));
const googleCallbackHandler = async (req, res) => {
    const profile = req.user;
    const email = profile?.emails?.[0]?.value;
    const name = profile?.displayName;
    const picture = profile?.photos?.[0]?.value;
    if (!email || !name || !picture) {
        return res.status(400).json({ message: "Missing user info from Google" });
    }
    const jwtSecret = process.env.JWT_SECRET;
    let user = await UserSchema_1.default.findOne({ email });
    if (!user) {
        user = new UserSchema_1.default({ email, name, picture });
        await user.save();
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.name }, jwtSecret, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, name: user.name }, jwtSecret, {
        expiresIn: "7d",
    });
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: expirationDate,
    });
    return res.status(200).json({
        status: "Success",
        token,
        data: user,
        message: user.isNew ? "Account created via Google" : "Google login successful",
    });
};
exports.googleCallbackHandler = googleCallbackHandler;
//# sourceMappingURL=GoogleAuth.js.map