import express from "express";
import { createDonor, deleteDonor, getDonors, getSingleDonor, updateDonor } from "../Controllers/BloodDonarSide/BloodDonarForm";
import { trycatch } from "../Utils/TryCatch";

const router = express.Router();

router.post("/donors", trycatch( createDonor ));
router.get("/donors", trycatch ( getDonors ));
router.get("/donors/:id", trycatch( getSingleDonor ));
router.put("/donors/:id", trycatch( updateDonor ));
router.delete("/donors/:id", trycatch( deleteDonor ));

export default router;
