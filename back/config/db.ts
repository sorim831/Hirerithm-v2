// backend/config/db.ts

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // 환경변수 로드

export const db = async (): Promise<void> => {
  try {
    const mongo_uri = process.env.MONGODB_URI;
    if (!mongo_uri) {
      throw new Error("mongoDB URL 불러오기 실패");
    }

    await mongoose.connect(mongo_uri);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
