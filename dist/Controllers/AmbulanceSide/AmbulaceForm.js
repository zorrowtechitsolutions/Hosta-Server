"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAmbulaces = exports.ambulanceDelete = exports.updateData = exports.getanAmbulace = exports.login = exports.Registeration = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AmbulanceSchema_1 = __importDefault(require("../../Model/AmbulanceSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Registeration = async (req, res) => {
    const { serviceName, address, latitude, longitude, phone, email, password, vehicleType, } = req.body;
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const exist = await AmbulanceSchema_1.default.findOne({ email: email });
    if (exist) {
        throw new http_errors_1.default.Conflict("Your email is already exist");
    }
    const newAmbulace = new AmbulanceSchema_1.default({
        serviceName: serviceName,
        address: address,
        email: email,
        latitude: latitude,
        longitude: longitude,
        password: hashedPassword,
        phone: phone,
        vehicleType: vehicleType,
    });
    await newAmbulace.save();
    return res
        .status(201)
        .json({ message: "Registeration completed successfully" });
};
exports.Registeration = Registeration;
//Ambulance Login
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await AmbulanceSchema_1.default.findOne({ email: email });
    if (!user) {
        throw new http_errors_1.default.NotFound("User not found! Please register");
    }
    const checkPassword = await bcrypt_1.default.compare(password, user.password);
    if (!checkPassword) {
        throw new http_errors_1.default.BadRequest("Wrong password, Plese try again");
    }
    const jwtKey = process.env.JWT_SECRET;
    if (!jwtKey) {
        throw new Error("JWT_SECRET is not defined");
    }
    // Generate JWT tokens
    const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.serviceName }, jwtKey, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, name: user.serviceName }, jwtKey, {
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
        message: "Loggedin successfully",
        token: token,
        data: user,
    });
};
exports.login = login;
// Get a specific ambulance details
const getanAmbulace = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        throw new http_errors_1.default.NotFound("User not found!");
    }
    const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const user = await AmbulanceSchema_1.default.findOne({ _id: id });
    if (!user) {
        throw new http_errors_1.default.NotFound("User not found!");
    }
    return res.status(200).json({
        status: "Success",
        data: user,
    });
};
exports.getanAmbulace = getanAmbulace;
//Update Ambulance Data
const updateData = async (req, res) => {
    const { id } = req.params;
    const { serviceName, address, latitude, longitude, phone, vehicleType } = req.body;
    const user = await AmbulanceSchema_1.default.findById(id);
    if (!user) {
        throw new http_errors_1.default.NotFound("User not found!");
    }
    user.serviceName = serviceName || user.serviceName;
    user.address = address || user.address;
    user.latitude = latitude || user.latitude;
    user.longitude = longitude || user.longitude;
    user.phone = phone || user.phone;
    user.vehicleType = vehicleType || user.vehicleType;
    await user.save();
    return res.status(200).json({
        message: "Updated data successfully",
        data: user,
    });
};
exports.updateData = updateData;
// Delete Ambulance
const ambulanceDelete = async (req, res) => {
    const { id } = req.params;
    if (req.cookies.refreshToken) {
        const expirationDate = new Date(0);
        res.cookie("refreshToken", "", {
            httpOnly: true,
            expires: expirationDate,
            secure: true,
            sameSite: "none",
        });
    }
    const hospital = await AmbulanceSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found!");
    }
    await AmbulanceSchema_1.default.deleteOne({ _id: id });
    return res.status(200).send("Your account deleted successfully");
};
exports.ambulanceDelete = ambulanceDelete;
// Get all ambulances
const getAmbulaces = async (req, res) => {
    const ambulances = await AmbulanceSchema_1.default.find();
    if (ambulances.length === 0) {
        throw new http_errors_1.default.NotFound("No Data Found!");
    }
    return res.status(200).json({
        status: "Success",
        data: ambulances,
    });
};
exports.getAmbulaces = getAmbulaces;
//# sourceMappingURL=AmbulaceForm.js.map