"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.RegistrationSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        "string.empty": "Hospital name is required.",
        "any.required": "Hospital name is a required field.",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please enter a valid email address.",
        "string.empty": "Email is required.",
        "any.required": "Email is a required field.",
    }),
    mobile: joi_1.default.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
        "string.pattern.base": "Mobile number must be exactly 10 digits.",
        "string.empty": "Mobile number is required.",
        "any.required": "Mobile number is a required field.",
    }),
    address: joi_1.default.string().required().messages({
        "string.empty": "Address is required.",
        "any.required": "Address is a required field.",
    }),
    latitude: joi_1.default.number().required().messages({
        "number.base": "Latitude must be a number.",
        "any.required": "Latitude is a required field.",
    }),
    longitude: joi_1.default.number().required().messages({
        "number.base": "Longitude must be a number.",
        "any.required": "Longitude is a required field.",
    }),
    password: joi_1.default.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters long.",
        "string.empty": "Password is required.",
        "any.required": "Password is a required field.",
    }),
    workingHours: joi_1.default.object({
        Monday: joi_1.default.object({
            open: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Opening time is required on Monday.",
                }),
            }),
            close: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Closing time is required on Monday.",
                }),
            }),
            isHoliday: joi_1.default.boolean().required().messages({
                "any.required": "Holiday status is required on Monday.",
            }),
        }),
        Tuesday: joi_1.default.object({
            open: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Opening time is required on Tuesday.",
                }),
            }),
            close: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Closing time is required on Tuesday.",
                }),
            }),
            isHoliday: joi_1.default.boolean().required().messages({
                "any.required": "Holiday status is required on Tuesday.",
            }),
        }),
        Wednesday: joi_1.default.object({
            open: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Opening time is required on Wednesday.",
                }),
            }),
            close: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Closing time is required on Wednesday.",
                }),
            }),
            isHoliday: joi_1.default.boolean().required().messages({
                "any.required": "Holiday status is required on Wednesday.",
            }),
        }),
        Thursday: joi_1.default.object({
            open: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Opening time is required on Thursday.",
                }),
            }),
            close: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Closing time is required on Thursday.",
                }),
            }),
            isHoliday: joi_1.default.boolean().required().messages({
                "any.required": "Holiday status is required on Thursday.",
            }),
        }),
        Friday: joi_1.default.object({
            open: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Opening time is required on Friday.",
                }),
            }),
            close: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Closing time is required on Friday.",
                }),
            }),
            isHoliday: joi_1.default.boolean().required().messages({
                "any.required": "Holiday status is required on Friday.",
            }),
        }),
        Saturday: joi_1.default.object({
            open: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Opening time is required on Saturday.",
                }),
            }),
            close: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Closing time is required on Saturday.",
                }),
            }),
            isHoliday: joi_1.default.boolean().required().messages({
                "any.required": "Holiday status is required on Saturday.",
            }),
        }),
        Sunday: joi_1.default.object({
            open: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Opening time is required on Sunday.",
                }),
            }),
            close: joi_1.default.string()
                .allow("")
                .when("isHoliday", {
                is: true,
                then: joi_1.default.optional(),
                otherwise: joi_1.default.required().messages({
                    "string.empty": "Closing time is required on Sunday.",
                }),
            }),
            isHoliday: joi_1.default.boolean().required().messages({
                "any.required": "Holiday status is required on Sunday.",
            }),
        }),
    })
        .required()
        .messages({
        "object.base": "Working hours must be an object with day-specific timings.",
    }),
});
//# sourceMappingURL=RegistrationJoiSchema.js.map