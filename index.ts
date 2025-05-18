import dotenv from "dotenv";
dotenv.config({ path: "./Config/.env" });
import cron from "node-cron";

import express from "express";
import cors from "cors";
import connectToDb from "./Config/dbConnection";
import userRoutes from "./Routes/UserRoutes";
import commenRoutes from "./Routes/CommenRoute";
import errorHandler from "./Middlewares/ErrorHandler";
import cookieParser from "cookie-parser";
import hospitalRoutes from "./Routes/HospitalRoute";
import AmbulanceRoutes from "./Routes/AmbulanceRoutes";
import BloodDonarRoutes from "./Routes/BloodDonarRoutes";
import MedicineRemainderRoutes from "./Routes/MedicineRemainderRoutes";
import LabRoutes from "./Routes/LabRoutes";
import {
  checkMissedDoses,
  checkAndRefillMedicines,
} from "./Controllers/MedicineRemainderSide/MedicineRemainderForm";

const app = express();

app.use(
  cors({
    origin: [
      process.env.UserSide_URL as string,
      process.env.AmbulanceSide_URL as string,
      process.env.HospitalSide_URL as string,
      "http://localhost:5173",
      "http://localhost:3029",
    ],
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Check if the origin is in the allowed list
//       const allowedOrigins = [
//         process.env.UserSide_URL,
//         process.env.AmbulanceSide_URL,
//         process.env.HospitalSide_URL,
//       ];
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// app.use(
//   cors({
//     origin: "*", // Allow all origins
//     credentials: true, // Allow credentials
//   })
// );

// Schedule the job to run every 1 minute
cron.schedule("* * * * *", async () => {
  await checkMissedDoses();
  await checkAndRefillMedicines();
});

app.use(express.json());
app.use(cookieParser());

// Fix route paths with leading '/'
app.use("/api", userRoutes);
app.use("/api", commenRoutes);
app.use("/api", hospitalRoutes);
app.use("/api", AmbulanceRoutes);
app.use("/api", BloodDonarRoutes);
app.use("/api", MedicineRemainderRoutes);
app.use("/api", LabRoutes);

connectToDb();

app.use(errorHandler);

app.listen(process.env.Port, () => {
  console.log(`App is running  http://localhost:${process.env.Port}`);
});

export default app;
