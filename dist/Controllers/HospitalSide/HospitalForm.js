"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hospitalDelete = exports.deleteDoctor = exports.updateDoctor = exports.addDoctor = exports.deleteSpecialty = exports.updateSpecialty = exports.addSpecialty = exports.updateHospitalDetails = exports.getHospitalDetails = exports.resetPassword = exports.HospitalLogin = exports.HospitalRegistration = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HospitalSchema_1 = __importDefault(require("../../Model/HospitalSchema"));
const RegistrationJoiSchema_1 = require("./RegistrationJoiSchema");
const cloudinary_1 = require("cloudinary");
const HospitalRegistration = async (req, res) => {
    const { name, type, email, mobile, address, latitude, longitude, password, workingHours, } = req.body;
    // Validate the request body using Joi
    const data = {
        name,
        email,
        mobile,
        address,
        latitude,
        longitude,
        password,
        workingHours,
    };
    const { error } = await RegistrationJoiSchema_1.RegistrationSchema.validate(data);
    if (error) {
        throw new http_errors_1.default.BadRequest(error?.details[0].message);
    }
    // Check if the hospital already exists with the same email
    const existingHospital = await HospitalSchema_1.default.findOne({ email });
    if (existingHospital) {
        throw new http_errors_1.default.Conflict("Email already exists. Please login.");
    }
    // Hash the password before saving it
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Prepare the hospital data
    const newHospital = new HospitalSchema_1.default({
        name,
        type,
        email,
        phone: mobile,
        address,
        latitude,
        longitude,
        password: hashedPassword,
        working_hours: Object.entries(workingHours).map(([day, hours]) => ({
            day,
            opening_time: hours.isHoliday ? null : hours.open,
            closing_time: hours.isHoliday ? null : hours.close,
            is_holiday: hours.isHoliday,
        })),
    });
    // Save the hospital to the database
    await newHospital.save();
    // Respond with a success message
    return res.status(201).json({ message: "Hospital registered successfully." });
};
exports.HospitalRegistration = HospitalRegistration;
//Hospital login
const HospitalLogin = async (req, res) => {
    const { email, password } = req.body;
    const hospital = await HospitalSchema_1.default.findOne({ email: email });
    if (!hospital) {
        throw new http_errors_1.default.Unauthorized("User not found!");
    }
    const isValidPassword = await bcrypt_1.default.compare(password, hospital.password);
    if (!isValidPassword) {
        throw new http_errors_1.default.Unauthorized("Invalid email or password");
    }
    const jwtKey = process.env.JWT_SECRET;
    if (!jwtKey) {
        throw new Error("JWT_SECRET is not defined");
    }
    // Generate JWT tokens
    const token = jsonwebtoken_1.default.sign({ id: hospital._id, name: hospital.name }, jwtKey, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: hospital._id, name: hospital.name }, jwtKey, {
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
        data: hospital,
        message: "Hospital logged in successfully.",
    });
};
exports.HospitalLogin = HospitalLogin;
// Reset pasword
const resetPassword = async (req, res) => {
    const { email, password } = req.body;
    const hospital = await HospitalSchema_1.default.findOne({ email: email });
    if (!hospital) {
        throw new http_errors_1.default.NotFound("No user found");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    hospital.password = hashedPassword;
    hospital.save();
    return res.status(200).json({
        message: "Password updated successfully",
    });
};
exports.resetPassword = resetPassword;
const getHospitalDetails = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw new http_errors_1.default.Unauthorized("No token provided. Please login.");
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        throw new http_errors_1.default.Unauthorized("Invalid token. Please login.");
    }
    const hospital = await HospitalSchema_1.default.findById(decoded.id);
    return res.status(200).json({
        status: "Success",
        data: hospital,
    });
};
exports.getHospitalDetails = getHospitalDetails;
//Update hospital details
const updateHospitalDetails = async (req, res) => {
    const { id } = req.params;
    const { name, email, mobile, address, latitude, longitude, workingHours, emergencyContact, about, image, currentPassword, newPassword, } = req.body;
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found. Wrong input");
    }
    if (currentPassword) {
        await bcrypt_1.default.compare(currentPassword, hospital.password).catch(() => {
            throw new http_errors_1.default.BadRequest("Current password is wrong");
        });
    }
    // Update the hospital fields
    if (newPassword) {
        const Password = await bcrypt_1.default.hash(newPassword, 10);
        hospital.password = Password;
    }
    hospital.name = name || hospital.name;
    hospital.email = email || hospital.email;
    hospital.phone = mobile || hospital.phone;
    hospital.address = address || hospital.address;
    hospital.latitude = latitude || hospital.latitude;
    hospital.longitude = longitude || hospital.longitude;
    hospital.working_hours = workingHours || hospital.working_hours;
    hospital.emergencyContact = emergencyContact || hospital.emergencyContact;
    hospital.about = about || hospital.about;
    hospital.image = image || hospital.image;
    // Save the updated hospital data
    await hospital.save();
    return res.status(200).json({
        status: "Success",
        message: "Hospital details updated successfully",
    });
};
exports.updateHospitalDetails = updateHospitalDetails;
// Add a new specialty
const addSpecialty = async (req, res) => {
    const { department_info, description, doctors, name, phone } = req.body;
    const { id } = req.params;
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found. Wrong input");
    }
    // Check the spectilty already exist
    const isExist = hospital.specialties.find((element) => element.name?.trim().toLowerCase() ===
        name.toString().trim().toLowerCase());
    if (isExist) {
        throw new http_errors_1.default.Conflict("Specialty is already exist!");
    }
    hospital.specialties.push({
        name: name,
        department_info: department_info,
        description: description,
        phone: phone,
        doctors: doctors,
    });
    await hospital.save();
    return res.status(201).json({
        status: "Successsss",
        message: "Specialty added successfully",
        data: hospital.specialties,
    });
};
exports.addSpecialty = addSpecialty;
// Update Specialty
const updateSpecialty = async (req, res) => {
    const { department_info, description, doctors, name, phone } = req.body;
    const { id } = req.params;
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found. Wrong input");
    }
    // Check the spectilty
    const specialty = hospital.specialties.find((element) => element.name === name);
    if (!specialty) {
        throw new http_errors_1.default.NotFound("Specialty not found.");
    }
    // Update the fields
    if (department_info !== undefined) {
        specialty.department_info = department_info;
    }
    if (description !== undefined) {
        specialty.description = description;
    }
    if (phone !== undefined) {
        specialty.phone = phone;
    }
    if (doctors !== undefined) {
        specialty.doctors = doctors;
    }
    if (name !== undefined) {
        specialty.name = name;
    }
    await hospital.save();
    return res.status(201).json({
        status: "Success",
        message: "Specialty updated successfully",
        data: hospital.specialties,
    });
};
exports.updateSpecialty = updateSpecialty;
// Delete a specialty
const deleteSpecialty = async (req, res) => {
    const { name } = req.query;
    const { id } = req.params;
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found. Wrong input");
    }
    // Check the spectilty
    const index = hospital.specialties.findIndex((element) => element.name?.trim().toLowerCase() === name.trim().toLowerCase());
    if (index === -1) {
        throw new http_errors_1.default.NotFound("Specialty not found.");
    }
    hospital.specialties.splice(index, 1);
    await hospital.save();
    return res.status(201).json({
        status: "Success",
        message: "Specialty deleted successfully",
        data: hospital.specialties,
    });
};
exports.deleteSpecialty = deleteSpecialty;
// Add a doctor
const addDoctor = async (req, res) => {
    const { id } = req.params;
    const { name, specialty, consulting, qualification } = req.body;
    const data = { name, consulting, qualification };
    const hospital = await HospitalSchema_1.default.findById(id);
    hospital?.specialties
        .filter((Specialty) => {
        return Specialty.name === specialty;
    })[0]
        .doctors.push(data);
    await hospital?.save();
    return res.status(201).json({
        message: `Added new doctor in ${specialty}`,
        data: hospital?.specialties,
    });
};
exports.addDoctor = addDoctor;
// Update Doctor
const updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { _id, name, specialty, consulting, qualification } = req.body;
    const data = { name, consulting, qualification };
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
    }
    const targetSpecialty = hospital.specialties.find((s) => s.name === specialty);
    if (!targetSpecialty) {
        throw new http_errors_1.default.NotFound(`Specialty ${specialty} not found`);
    }
    const targetDoctor = targetSpecialty.doctors.find((d) => d._id == _id);
    if (!targetDoctor) {
        throw new http_errors_1.default.NotFound(`Doctor with ID ${_id} not found in specialty ${specialty}`);
    }
    targetDoctor.name = data.name;
    targetDoctor.consulting = data.consulting;
    await hospital.save();
    return res.status(200).json({
        message: `Doctor in ${specialty} updated successfully`,
        data: hospital.specialties,
    });
};
exports.updateDoctor = updateDoctor;
// Delete Doctor
const deleteDoctor = async (req, res) => {
    const { hospital_id, doctor_id } = req.params;
    const { specialty_name } = req.query;
    const hospital = await HospitalSchema_1.default.findById(hospital_id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found!");
    }
    const targetSpecialty = hospital.specialties.find((s) => s.name?.trim().toLowerCase() === specialty_name.trim().toLowerCase());
    targetSpecialty?.doctors.forEach((doctor, index) => {
        if (doctor._id.toString() == doctor_id) {
            targetSpecialty.doctors.splice(index, 1);
        }
    });
    await hospital.save();
    return res.status(200).json({
        message: `Doctor in ${specialty_name} deleted successfully`,
        data: hospital.specialties,
    });
};
exports.deleteDoctor = deleteDoctor;
const hospitalDelete = async (req, res) => {
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
    const hospital = await HospitalSchema_1.default.findById(id);
    if (!hospital) {
        throw new http_errors_1.default.NotFound("Hospital not found!");
    }
    if (hospital.image?.public_id) {
        await cloudinary_1.v2.uploader.destroy(hospital.image.public_id);
    }
    await HospitalSchema_1.default.deleteOne({ _id: id });
    return res.status(200).send("Your account deleted successfully");
};
exports.hospitalDelete = hospitalDelete;
//# sourceMappingURL=HospitalForm.js.map