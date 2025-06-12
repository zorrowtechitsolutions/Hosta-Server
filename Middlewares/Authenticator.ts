import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";

const Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new createError.Unauthorized(
        "No or invalid token format. Please login."
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (!decoded) {
      throw new createError.Unauthorized("Invalid token. Please login.");
    }

    next();
  } catch (err: any) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new createError.Unauthorized("Invalid or expired token."));
    }
    next(err);
  }
};

export default Auth;
