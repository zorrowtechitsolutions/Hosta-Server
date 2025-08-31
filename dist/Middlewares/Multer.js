"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const HospitalSchema_1 = __importDefault(require("../Model/HospitalSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB file size limit
    },
});
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadFile = (req, res) => {
    return new Promise((resolve, reject) => {
        upload.single("image")(req, res, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(req.file);
        });
    });
};
const uploadImage = async (req, res) => {
    const { id } = req.params;
    const file = await uploadFile(req, res);
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found!");
    }
    // If there's an existing image, delete it from Cloudinary
    if (hospital.image?.public_id) {
        await cloudinary_1.v2.uploader.destroy(hospital.image.public_id);
    }
    if (file) {
        const normalizedPath = path_1.default.normalize(file.path);
        const result = await cloudinary_1.v2.uploader.upload(normalizedPath);
        hospital.image = {
            imageUrl: result.secure_url,
            public_id: result.public_id,
        };
        await hospital.save();
        return res.status(200).json({ imageUrl: result.secure_url });
    }
    else {
        throw new http_errors_1.default.BadRequest("No file uploaded!");
    }
};
exports.uploadImage = uploadImage;
//# sourceMappingURL=Multer.js.map