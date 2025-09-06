import multer, { FileFilterCallback } from "multer";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import Hospital from "../Model/HospitalSchema";
import createError from "http-errors";
import path from "path";
import sharp from "sharp";

const storage = multer.diskStorage({});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = (req: Request, res: Response): Promise<any> => {
  return new Promise((resolve, reject) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(req.file);
    });
  });
};

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const file = await uploadFile(req, res);

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found!");
  }

  // If there's an existing image, delete it from Cloudinary
  if (hospital.image?.public_id) {
    await cloudinary.uploader.destroy(hospital.image.public_id);
  }

  if (file) {
    const normalizedPath = path.normalize(file.path);
    const result = await cloudinary.uploader.upload(normalizedPath);

    hospital.image = {
      imageUrl: result.secure_url,
      public_id: result.public_id,
    };
    await hospital.save();

    return res.status(200).json({ imageUrl: result.secure_url });
  } else {
    throw new createError.BadRequest("No file uploaded!");
  }
};



declare global {
  namespace Express {
    interface Request {
      cloudinaryImageUrl?: string | string[];
    }
  }
}


// Use memory storage (keeps image in memory, not on disk)

const uploads = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per image
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload a single image (compressed, direct to Cloudinary)
export const uploadImageSingle = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  uploads.single("image")(req, res, async (err: any) => {
    if (err) return next(err);

    try {
      if (!req.file) return next(new Error("No file provided"));

      const compressedBuffer = await sharp(req.file.buffer)
        .jpeg({
          quality: 80,
          chromaSubsampling: "4:4:4",
          mozjpeg: true,
        })
        .toBuffer();

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "users" }, // optional: change folder
          (error, result) => {
            if (error) return reject(error);
            resolve(result as UploadApiResponse);
          }
        );
        stream.end(compressedBuffer);
      });

      req.cloudinaryImageUrl = result.secure_url;
      next();
    } catch (error) {
      next(error);
    }
  });
};

