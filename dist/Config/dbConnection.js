"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectToDb = async () => {
    try {
        mongoose_1.default
            .connect(process.env.MongoDB_String)
            .then(() => console.log("Connected to Database"));
    }
    catch (error) { }
};
exports.default = connectToDb;
//# sourceMappingURL=dbConnection.js.map