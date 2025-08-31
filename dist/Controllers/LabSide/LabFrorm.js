"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLab = exports.updateLab = exports.getSingleLab = exports.getLabs = exports.createLab = void 0;
const labSchema_1 = __importDefault(require("../../Model/labSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
// ✅ Create a Lab
const createLab = async (req, res) => {
    const { name, email, phone, time, services, location } = req.body;
    const exists = await labSchema_1.default.findOne({ email });
    if (exists)
        throw new http_errors_1.default.Conflict("Email already exists");
    const lab = new labSchema_1.default({ name, email, phone, time, services, location });
    await lab.save();
    return res.status(201).json({ message: "Lab created successfully", lab });
};
exports.createLab = createLab;
// 🔍 Get All Labs (with pagination & search)
const getLabs = async (req, res) => {
    const { page = 1, limit = 10, search = "", pincode, place } = req.query;
    const query = {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { "location.place": { $regex: search, $options: "i" } },
        ],
    };
    if (pincode)
        query["location.pincode"] = +pincode;
    if (place)
        query["location.place"] = { $regex: place, $options: "i" };
    const labs = await labSchema_1.default.find(query)
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort({ createdAt: -1 });
    const total = await labSchema_1.default.countDocuments(query);
    return res.status(200).json({ labs, total, page: +page, totalPages: Math.ceil(total / +limit) });
};
exports.getLabs = getLabs;
// 📄 Get Single Lab
const getSingleLab = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new http_errors_1.default.BadRequest("Invalid Lab ID");
    const lab = await labSchema_1.default.findById(id);
    if (!lab)
        throw new http_errors_1.default.NotFound("Lab not found");
    return res.status(200).json(lab);
};
exports.getSingleLab = getSingleLab;
// 📝 Update Lab
const updateLab = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    if (!id)
        throw new http_errors_1.default.BadRequest("Invalid Lab ID");
    const lab = await labSchema_1.default.findByIdAndUpdate(id, updateData, { new: true });
    if (!lab)
        throw new http_errors_1.default.NotFound("Lab not found");
    return res.status(200).json({ message: "Lab updated", lab });
};
exports.updateLab = updateLab;
// ❌ Delete Lab
const deleteLab = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new http_errors_1.default.BadRequest("Invalid Lab ID");
    const lab = await labSchema_1.default.findByIdAndDelete(id);
    if (!lab)
        throw new http_errors_1.default.NotFound("Lab not found");
    return res.status(200).json({ message: "Lab deleted successfully" });
};
exports.deleteLab = deleteLab;
//# sourceMappingURL=LabFrorm.js.map