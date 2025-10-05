"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logout = exports.Refresh = exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const sendMail = async (req, res) => {
    const { from, to, subject, text } = req.body;
    console.log("Request body:", from, to, subject, text);
    try {
        // Configure transporter
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "hostahealthcare@gmail.com",
                pass: "nafs qdsv yexe zmhi", // App Password
            },
        });
        // Define mail options
        const mailOptions = {
            from,
            to,
            subject,
            text,
        };
        // Send email (no callback, just await)
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return res.status(200).json({
            message: "Email sent successfully!",
            info: info.response,
        });
    }
    catch (error) {
        console.error("Error while sending email:", error);
        return res.status(500).json({
            message: "Failed to send email",
            error: error.message,
        });
    }
};
exports.sendMail = sendMail;
// Refresh tokens
const Refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new http_errors_1.default.Unauthorized("No refresh token provided");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
        const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id, name: decoded.name }, process.env.JWT_SECRET, { expiresIn: "24h" });
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: decoded.id, name: decoded.name }, process.env.JWT_SECRET, { expiresIn: "2d" });
        const twoDayInMs = 2 * 24 * 60 * 60 * 1000;
        const expirationDate = new Date(Date.now() + twoDayInMs);
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            expires: expirationDate,
            secure: true,
            sameSite: "none",
        });
        return res.json({
            message: "Access token refreshed successfully",
            accessToken: accessToken,
        });
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};
exports.Refresh = Refresh;
// Logout
const Logout = async (req, res) => {
    if (req.cookies.refreshToken) {
        const expirationDate = new Date(0);
        res.cookie("refreshToken", "", {
            httpOnly: true,
            expires: expirationDate,
            secure: true,
            sameSite: "none",
        });
    }
    return res.status(200).send("Logged out successfully");
};
exports.Logout = Logout;
//# sourceMappingURL=Commen.js.map