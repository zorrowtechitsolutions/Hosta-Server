"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDonor = exports.updateDonor = exports.getDonorId = exports.getSingleDonor = exports.getDonors = exports.createDonor = void 0;
const BloodDonarSchema_1 = __importDefault(require("../../Model/BloodDonarSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const UserSchema_1 = __importDefault(require("../../Model/UserSchema"));
// ✅ Create a Donor
const createDonor = async (req, res) => {
    try {
        const { phone, dateOfBirth, bloodGroup, address, userId, } = req.body.newDonor;
        // Check if donor already exists by email
        const exists = await BloodDonarSchema_1.default.findOne({ phone });
        if (exists) {
            throw new http_errors_1.default.Conflict("Phone already exists");
        }
        // Validate phone number - remove starting 0 if needed
        const cleanedPhone = phone.startsWith("0") ? phone.slice(1) : phone;
        if (!/^\d{10}$/.test(cleanedPhone)) {
            throw new http_errors_1.default.BadRequest("Phone number must be exactly 10 digits");
        }
        const existingUser = await UserSchema_1.default.findById(userId);
        if (!existingUser) {
            throw new http_errors_1.default.NotFound("User not found");
        }
        const existingDonor = await BloodDonarSchema_1.default.findOne({ userId });
        if (existingDonor) {
            throw new http_errors_1.default.BadRequest("Donor already created");
        }
        const donor = new BloodDonarSchema_1.default({
            phone: cleanedPhone,
            dateOfBirth,
            bloodGroup,
            address,
            userId,
        });
        await donor.save();
        return res.status(201).json({
            message: "Donor created successfully",
            donor,
            status: 201,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            // MongoDB duplicate key error
            return res
                .status(409)
                .json({ message: "Email or phone already exists", status: 409 });
        }
        // Other errors
        const statusCode = error.status || 500;
        const message = error.message || "Internal Server Error";
        return res.status(statusCode).json({ message, status: statusCode });
    }
};
exports.createDonor = createDonor;
// 🔍 Get All Donors (with pagination & search)
const getDonors = async (req, res) => {
    const { search = "", bloodGroup, pincode, place } = req.query;
    const query = {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { bloodGroup: { $regex: search, $options: "i" } },
            { "address.place": { $regex: search, $options: "i" } },
        ],
    };
    if (bloodGroup)
        query.bloodGroup = bloodGroup;
    if (pincode)
        query["address.pincode"] = pincode;
    if (place)
        query["address.place"] = place;
    const donors = await BloodDonarSchema_1.default.find(query)
        .populate("userId")
        .sort({ createdAt: -1 });
    return res.status(200).json({ donors, total: donors.length });
};
exports.getDonors = getDonors;
// 📄 Get Single Donor
const getSingleDonor = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new http_errors_1.default.BadRequest("Invalid donor ID");
    const donor = await BloodDonarSchema_1.default.findById(id).populate("userId");
    if (!donor)
        throw new http_errors_1.default.NotFound("Donor not found");
    return res.status(200).json(donor);
};
exports.getSingleDonor = getSingleDonor;
// 📄 Get  Donor id
const getDonorId = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new http_errors_1.default.BadRequest("Invalid donor ID");
    const donor = await BloodDonarSchema_1.default.findOne({ userId: id });
    if (!donor)
        throw new http_errors_1.default.NotFound("Donor not found");
    return res.status(200).json(donor);
};
exports.getDonorId = getDonorId;
// 📝 Update Donor
const updateDonor = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    if (!id)
        throw new http_errors_1.default.BadRequest("Invalid donor ID");
    const donor = await BloodDonarSchema_1.default.findByIdAndUpdate(id, updateData, {
        new: true,
    });
    if (!donor)
        throw new http_errors_1.default.NotFound("Donor not found");
    return res.status(200).json({ message: "Donor updated", donor });
};
exports.updateDonor = updateDonor;
// ❌ Delete Donor
const deleteDonor = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new http_errors_1.default.BadRequest("Invalid donor ID");
    const donor = await BloodDonarSchema_1.default.findByIdAndDelete(id);
    if (!donor)
        throw new http_errors_1.default.NotFound("Donor not found");
    return res.status(200).json({ message: "Donor deleted successfully" });
};
exports.deleteDonor = deleteDonor;
//# sourceMappingURL=BloodDonarForm.js.map