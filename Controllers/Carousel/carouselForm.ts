import { Request, Response } from "express";
import createError from "http-errors";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { uploadImage} from "../../Middlewares/Multer";
import Hospital from "../../Model/HospitalSchema";

// POST /api/hospitals/:id/ads
export const uploadAd = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  // Upload file with multer
  await uploadImage(req, res);
  const file = req.file;

  // Find hospital
  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found!");
  }

  if (!file) {
    throw new createError.BadRequest("No file uploaded!");
  }

  // Upload to Cloudinary
  const normalizedPath = path.normalize(file.path);
  const result = await cloudinary.uploader.upload(normalizedPath, {
    folder: `hospital_ads/${id}`,
  });

  // Add new ad to hospital.ads
  const newAd = {
    imageUrl: result.secure_url,
    public_id: result.public_id,
    title: req.body.title || "",
    startDate: req.body.startDate || Date.now(),
    endDate: req.body.endDate || null,
    isActive: true,
  };

  hospital.ads.push(newAd);
  await hospital.save();

  return res.status(201).json(newAd);
};



// DELETE /api/hospitals/:hospitalId/ads/:adId
export const deleteAd = async (req: Request, res: Response) => {
  const { hospitalId, adId } = req.params;
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) throw new createError.NotFound("Hospital not found!");

  const ad = hospital.ads.id(adId);
  if (!ad) throw new createError.NotFound("Ad not found!");

  // Delete image from Cloudinary
  if (ad.public_id) await cloudinary.uploader.destroy(ad.public_id);

  await ad.deleteOne();
  await hospital.save();

  return res.status(200).json({ message: "Ad deleted successfully" });
};



// PUT /api/hospitals/:hospitalId/ads/:adId
export const updateAd = async (req: Request, res: Response) => {
  const { hospitalId, adId } = req.params;
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) throw new createError.NotFound("Hospital not found!");

  const ad = hospital.ads.id(adId);
  if (!ad) throw new createError.NotFound("Ad not found!");

  // Update title / dates
  if (req.body.title) ad.title = req.body.title;
  if (req.body.startDate) ad.startDate = req.body.startDate;
  if (req.body.endDate) ad.endDate = req.body.endDate;
  if (req.body.isActive !== undefined) ad.isActive = req.body.isActive;

  // Replace image if file uploaded
  const file = await uploadImage(req, res);
  if (file) {
    if (ad.public_id) await cloudinary.uploader.destroy(ad.public_id);
    if (!req.file || !req.file.path) {
      throw new createError.BadRequest("No file uploaded for ad image update!");
    }
    const result = await cloudinary.uploader.upload(path.normalize(req.file.path), {
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
    const { lat, lng } = req.query;

    if (!lat || !lng) return res.status(400).json({ message: "Latitude and longitude required" });

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const radiusInMeters = 5000; // 5km

    // Fetch hospitals that have ads
    const hospitals = await Hospital.find({
      latitude: { $exists: true },
      longitude: { $exists: true },
      ads: { $exists: true, $not: { $size: 0 } },
    });

    // Filter ads manually based on distance
    const nearbyAds: any[] = [];
    const R = 6371; // km
    hospitals.forEach((hospital) => {
      const dLat = ((hospital.latitude! - userLat) * Math.PI) / 180;
      const dLon = ((hospital.longitude! - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((hospital.latitude! * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c * 1000; // meters

      if (distance <= radiusInMeters) {
        hospital.ads.forEach((ad) => {
          if (ad.isActive) nearbyAds.push(ad);
        });
      }
    });

    res.json(nearbyAds);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};