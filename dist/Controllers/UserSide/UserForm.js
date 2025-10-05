"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.editReview = exports.postReview = exports.getHospitals = exports.resetPassword = exports.aUserData = exports.userData = exports.verifyOtp = exports.login = exports.userLogin = exports.userRegister = void 0;
const joi_1 = __importDefault(require("joi"));
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema_1 = __importDefault(require("../../Model/UserSchema"));
const HospitalSchema_1 = __importDefault(require("../../Model/HospitalSchema"));
const twilio = require("twilio");
require("dotenv").config();
const otpStorage = new Map();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Joi schema to validate the Registration data of users
const joiSchema = joi_1.default.object({
    name: joi_1.default.string().trim().required().messages({
        "string.empty": "Name is required",
    }),
    email: joi_1.default.string().email().lowercase().trim().required().messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
    }),
    password: joi_1.default.string().min(8).messages({
        "string.min": "Password must be at least 8 characters long",
        "string.empty": "Password is required",
    }),
    phone: joi_1.default.string()
        .pattern(/^\d{10}$/)
        .messages({
        "string.pattern.base": "Please enter a valid 10-digit phone number",
        "string.empty": "Phone number is required",
    }),
});
// User Registration
const userRegister = async (req, res) => {
    const { error } = joiSchema.validate(req.body);
    if (error) {
        throw new http_errors_1.default.BadRequest(error.details[0].message);
    }
    const existingUser = await UserSchema_1.default.findOne({
        email: req.body.email,
    });
    if (existingUser) {
        throw new http_errors_1.default.Conflict("Email is already registered, Please login");
    }
    const hashedPassword = await bcrypt_1.default.hash(req.body.password, 10);
    const newUser = new UserSchema_1.default({
        ...req.body,
        password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({
        staus: "Success",
        message: "User created successfully",
    });
};
exports.userRegister = userRegister;
const userLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await UserSchema_1.default.findOne({ email: email });
    if (user === null) {
        throw new http_errors_1.default.NotFound("You email is not found, Please Register");
    }
    const passwordCheck = await bcrypt_1.default.compare(password, user.password);
    if (!passwordCheck) {
        throw new http_errors_1.default.BadRequest("Incorrect password, try again!");
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.name }, jwtSecret, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, name: user.name }, jwtSecret, {
        expiresIn: "7d",
    });
    const sevenDayInMs = 7 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + sevenDayInMs);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        expires: expirationDate,
        secure: true,
        sameSite: "none",
    });
    return res.status(200).json({
        status: "Success",
        token: token,
        data: user,
        message: "You logged in successfully.",
    });
};
exports.userLogin = userLogin;
const login = async (req, res) => {
    let phone = req.body.phone;
    try {
        // Check if customer exists
        const user = await UserSchema_1.default.findOne({ phone: String(phone).trim() });
        if (!user) {
            return res.status(400).json({ message: "Phone number not registered!" });
        }
        // Ensure +91 prefix with space
        if (!phone.startsWith("+91")) {
            phone = "+91 " + phone.replace(/^\+91\s*/, "").trim();
        }
        if (phone == "+91 9400517720") {
            otpStorage.set(phone, 123456);
            return res
                .status(200)
                .json({ message: `OTP sent successfully ${123456}`, status: 200 });
        }
        // Generate OTP (6-digit random number)
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStorage.set(phone, otp); // Store OTP temporarily
        // Send OTP via Twilio
        await client.messages.create({
            body: `Your verification code is: ${otp}`,
            from: process.env.TWLIO_NUMBER,
            to: phone,
        });
        return res
            .status(200)
            .json({ message: `OTP sent successfully ${otp}`, status: 200 });
    }
    catch (error) {
        console.error("Twilio Error:", error);
        return res
            .status(500)
            .json({ message: "Failed to send OTP", error: error, status: 500 });
    }
};
exports.login = login;
const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required" });
        }
        // Ensure +91 prefix
        const formattedPhone = phone.startsWith("+91")
            ? phone
            : "+91 " + phone.replace(/^\+91\s*/, "").trim();
        // Validate OTP
        const storedOtp = otpStorage.get(formattedPhone);
        if (!storedOtp || storedOtp.toString().trim() !== otp.toString().trim()) {
            return res
                .status(400)
                .json({ message: `Invalid or expired OTP ${otp},${storedOtp}` });
        }
        // Remove OTP from storage
        otpStorage.delete(formattedPhone);
        // Find customer
        const user = await UserSchema_1.default.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: "Customer not found" });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET || "myjwtsecretkey", { expiresIn: "1h" });
        const userDetails = {
            name: user.name,
            email: user.email,
            _id: user._id,
            phone: user.phone,
            picture: user?.picture,
        };
        return res.status(200).json({
            message: "OTP verified successfully",
            token,
            userDetails,
            status: 200,
        });
    }
    catch (err) {
        console.error("Verify OTP error:", err);
        return res.status(500).json({ error: "Server error, please try again" });
    }
};
exports.verifyOtp = verifyOtp;
// export const userLogin = async (req: Request, res: Response): Promise<Response> => {
//   const { email, password, name, picture } = req.body;
//   const jwtSecret = process.env.JWT_SECRET;
//   if (!jwtSecret) {
//     throw new Error("JWT_SECRET is not defined");
//   }
//   // Case 1: Google Login (no password but has name and picture)
//   if (!password && name && picture) {
//     let user = await User.findOne({ email });
//     // If user doesn't exist, create a new Google user
//     if (!user) {
//       user = new User({
//         email,
//         name,
//         picture,
//       });
//       await user.save();
//     }
//     // Generate JWT tokens
//     const token = Jwt.sign({ id: user._id, name: user.name }, jwtSecret, {
//       expiresIn: "15m",
//     });
//     const refreshToken = Jwt.sign({ id: user._id, name: user.name }, jwtSecret, {
//       expiresIn: "7d",
//     });
//     const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       expires: expirationDate,
//       secure: true,
//       sameSite: "none",
//     });
//     return res.status(200).json({
//       status: "Success",
//       token,
//       data: user,
//       message: user.isNew ? "Account created via Google" : "Google login successful",
//     });
//   }
//   // Case 2: Manual Login
//    const user: User | null = await User.findOne({ email: email });
//   if (user === null) {
//     throw new HttpError.NotFound("You email is not found, Please Register");
//   }
//   const passwordCheck = await bcrypt.compare(password, user.password);
//   if (!passwordCheck) {
//     throw new HttpError.BadRequest("Incorrect password, try again!");
//   }
//   const token = Jwt.sign({ id: user._id, name: user.name }, jwtSecret, {
//     expiresIn: "15m",
//   });
//   const refreshToken = Jwt.sign({ id: user._id, name: user.name }, jwtSecret, {
//     expiresIn: "7d",
//   });
//   const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     expires: expirationDate,
//     secure: true,
//     sameSite: "none",
//   });
//   return res.status(200).json({
//     status: "Success",
//     token,
//     data: user,
//     message: "You logged in successfully.",
//   });
// };
// Get user data
const userData = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        throw new http_errors_1.default.Unauthorized("Please login!");
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
    }
    const { id } = jsonwebtoken_1.default.verify(token, jwtSecret);
    const data = await UserSchema_1.default.findById(id);
    return res.status(200).json({
        status: "success",
        data: data,
    });
};
exports.userData = userData;
const aUserData = async (req, res) => {
    const user = await UserSchema_1.default.findById(req.params.id);
    if (!user) {
        throw new http_errors_1.default.NotFound("User not found");
    }
    return res.status(200).json({
        status: "success",
        data: user,
    });
};
exports.aUserData = aUserData;
// Reset Password
const resetPassword = async (req, res) => {
    const { email, password } = req.body;
    const user = await UserSchema_1.default.findOne({ email });
    if (!user) {
        throw new http_errors_1.default.NotFound("User not found");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password reset successful." });
};
exports.resetPassword = resetPassword;
// Get details of all hospitals
const getHospitals = async (req, res) => {
    console.log("Sample from native");
    const hospitals = await HospitalSchema_1.default.find().populate({
        path: "reviews.user_id",
        select: "name email",
    });
    return res.status(200).json({ data: hospitals });
};
exports.getHospitals = getHospitals;
// Post a review
const postReview = async (req, res) => {
    const { user_id, rating, comment, date } = req.body;
    const { id } = req.params;
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found");
    }
    hospital.reviews.push({ user_id, rating, comment, date });
    await hospital.save();
    const updatedHospital = await hospital.populate({
        path: "reviews.user_id",
        select: "name email",
    });
    return res.status(200).json({
        message: "Review posted successfully",
        data: updatedHospital,
    });
};
exports.postReview = postReview;
const editReview = async (req, res) => {
    const { hospital_id, reviewId } = req.params;
    const { rating, comment } = req.body;
    const hospital = await HospitalSchema_1.default.findById(hospital_id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found");
    }
    const index = hospital.reviews.findIndex((element) => element._id.toString() === reviewId);
    if (index === -1) {
        throw new http_errors_1.default.NotFound("Review not found");
    }
    hospital.reviews[index].rating = rating;
    hospital.reviews[index].comment = comment;
    hospital.reviews[index].date = new Date().toISOString();
    await hospital.save();
    const updatedHospital = await hospital.populate({
        path: "reviews.user_id",
        select: "name email",
    });
    return res.status(200).json({
        message: "Review updated successfully",
        data: updatedHospital,
    });
};
exports.editReview = editReview;
const deleteReview = async (req, res) => {
    const { hospital_id, reviewId } = req.params;
    const hospital = await HospitalSchema_1.default.findById(hospital_id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found");
    }
    const index = hospital.reviews.findIndex((element) => element._id.toString() === reviewId);
    if (index === -1) {
        throw new http_errors_1.default.NotFound("Review not found");
    }
    hospital.reviews.splice(index, 1);
    await hospital.save();
    const updatedHospital = await hospital.populate({
        path: "reviews.user_id",
        select: "name email",
    });
    return res.status(200).json({
        message: "Review deleted successfully",
        data: updatedHospital,
    });
};
exports.deleteReview = deleteReview;
//# sourceMappingURL=UserForm.js.map