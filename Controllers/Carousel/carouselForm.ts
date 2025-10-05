import { Request, Response } from "express";
import createError from "http-errors";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { uploadFile } from "../../Middlewares/Multer";
import Hospital from "../../Model/HospitalSchema";
import { log } from "console";

// POST /api/hospitals/:id/ads
export const uploadAd = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const file = req.file; // uploaded image
    const { title, startDate, endDate } = req.body;
    console.log(req.body);

    // Find hospital
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      throw new createError.NotFound("Hospital not found!");
    }

    if (!file) {
      throw new createError.BadRequest("No file uploaded!");
    }

    const normalizedPath = path.normalize(file.path);
    console.log("Uploading file at path:", normalizedPath);

    const result = await cloudinary.uploader.upload(normalizedPath);

    console.log("Cloudinary upload result:", result);

    // Add new ad to hospital.ads
    const newAd = {
      imageUrl: result.secure_url as string,
      public_id: result.public_id as string,
      title: req.body.title || "",
      startDate: req.body.startDate || Date.now(),
      endDate: req.body.endDate || null,
      isActive: true,
    };

    hospital.ads.push(newAd);
    await hospital.save();

    return res.status(201).json(newAd);
  } catch (error) {
    console.error("Error uploading ad:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/hospitals/:hospitalId/ads/:adId
export const deleteAd = async (req: Request, res: Response) => {
  const { hospitalId, adId } = req.params;
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) throw new createError.NotFound("Hospital not found!");

  const ad = hospital.ads.find((ad) => ad._id?.toString() === adId.toString());
  if (!ad) throw new createError.NotFound("Ad not found!");

  // Delete image from Cloudinary
  if (ad.public_id) await cloudinary.uploader.destroy(ad.public_id);

  await ad.deleteOne();
  await hospital.save();

  return res.status(200).json({ message: "Ad deleted successfully" });
};

// In your controller
export const updateAd = async (req: Request, res: Response) => {
  const { hospitalId, adId } = req.params;

  // At this point, Multer must already have processed the request
  const file = req.file; // uploaded image
  const { title, startDate, endDate, isActive } = req.body; // text fields

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) throw new createError.NotFound("Hospital not found!");

  const ad = hospital.ads.id(adId);
  if (!ad) throw new createError.NotFound("Ad not found!");

  if (title) ad.title = title;
  if (startDate) ad.startDate = startDate;
  if (endDate) ad.endDate = endDate;
  if (isActive !== undefined) ad.isActive = isActive === "true";

  if (file) {
    if (ad.public_id) await cloudinary.uploader.destroy(ad.public_id);
    const result = await cloudinary.uploader.upload(path.normalize(file.path), {
      folder: `hospital_ads/${hospitalId}`,
    });
    ad.imageUrl = result.secure_url;
    ad.public_id = result.public_id;
  }

  await hospital.save();
  return res.status(200).json(ad);
};

// GET /api/ads/nearby?lat=...&lng=...

export const GetAds = async (req: Request, res: Response) => {
  try {

    // Fetch hospitals that have ads
    const ads = await Hospital.find({
      ads: { $exists: true, $not: { $size: 0 } },
    });


    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};


// GET /api/hospitals/:id/ads - Get all ads for a specific hospital
export const GetAdsHospital = async (req: Request, res: Response) => {
  const hospitalId = req.params.id;
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return res.status(404).json({ message: "Hospital not found" });
  }

  return res.status(200).json(hospital.ads);
};
