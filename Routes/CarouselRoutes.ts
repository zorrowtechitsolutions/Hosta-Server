// routes/hospitalAdsRoutes.ts
import { Router } from "express";
import {
  uploadAd,
  deleteAd,
  updateAd,
  GetAds,
} from "../Controllers/Carousel/carouselForm";

const router = Router();

// -------------------------
// Hospital Ads Routes
// -------------------------

// Create/upload a new ad for a hospital
// POST /api/hospitals/:id/ads
router.post("/hospitals/:id/ads", uploadAd);

// Update an existing ad
// PUT /api/hospitals/:hospitalId/ads/:adId
router.put("/hospitals/:hospitalId/ads/:adId", updateAd);

// Delete an ad
// DELETE /api/hospitals/:hospitalId/ads/:adId
router.delete("/hospitals/:hospitalId/ads/:adId", deleteAd);

// Get nearby ads
// GET /api/ads/nearby?lat=...&lng=...
router.get("/ads/nearby", GetAds);

export default router;
