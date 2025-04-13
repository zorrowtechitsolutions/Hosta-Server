import { Request, Response } from "express";
import BloodDonor from "../../Model/BloodDonarSchema";
import createError from "http-errors";


// ✅ Create a Donor
export const createDonor = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, phone, age, bloodGroup, address, lastDonationDate } = req.body;
  
    const exists = await BloodDonor.findOne({ email });
    if (exists) throw new createError.Conflict("Email already exists");
  
    const donor = new BloodDonor({ name, email, phone, age, bloodGroup, address, lastDonationDate });
    await donor.save();
  
    return res.status(201).json({ message: "Donor created successfully", donor });
  };
  
  // 🔍 Get All Donors (with pagination & search)
  export const getDonors = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10, search = "", bloodGroup, pincode, place } = req.query;
    // demo
    // /api/donors?search=a&bloodGroup=O+&pincode=123456

    const query: any = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bloodGroup: { $regex: search, $options: "i" } },
        { "address.place": { $regex: search, $options: "i" } },
      ],
    };
  
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (pincode) query["address.pincode"] = +pincode;
    if (place) query["address.place"] = +place;

  
    const donors = await BloodDonor.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });
  
    const total = await BloodDonor.countDocuments(query);
  
    return res.status(200).json({ donors, total, page: +page, totalPages: Math.ceil(total / +limit) });
  };
  
  // 📄 Get Single Donor
  export const getSingleDonor = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
  
    if (!id) throw new createError.BadRequest("Invalid donor ID");
  
    const donor = await BloodDonor.findById(id);
    if (!donor) throw new createError.NotFound("Donor not found");
  
    return res.status(200).json(donor);
  }; 
  
  // 📝 Update Donor
  export const updateDonor = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const updateData = req.body;
  
    if (!id) throw new createError.BadRequest("Invalid donor ID");
  
    const donor = await BloodDonor.findByIdAndUpdate(id, updateData, { new: true });
    if (!donor) throw new createError.NotFound("Donor not found");
  
    return res.status(200).json({ message: "Donor updated", donor });
  };
  
  // ❌ Delete Donor
  export const deleteDonor = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
  
    if (!id) throw new createError.BadRequest("Invalid donor ID");
  
    const donor = await BloodDonor.findByIdAndDelete(id);
    if (!donor) throw new createError.NotFound("Donor not found");
  
    return res.status(200).json({ message: "Donor deleted successfully" });
  };
  