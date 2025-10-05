import mongoose, { Document, Schema, Model } from "mongoose";

export type RecruiterRole = "headhunter" | "company";

// Recruiter 문서 타입
export interface RecruiterDocument extends Document {
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: RecruiterRole;
  company_name: string;
  created_at: Date;
}

// 스키마 정의
const recruiterSchema: Schema<RecruiterDocument> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "올바른 이메일 형식이 아닙니다.",
    ],
  },
  password_hash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{3}-?\d{4}-?\d{4}$/, "올바른 전화번호 형식이 아닙니다."],
  },
  role: {
    type: String,
    enum: ["headhunter", "company"],
    required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// 모델 정의
const Recruiter: Model<RecruiterDocument> = mongoose.model<RecruiterDocument>(
  "Recruiter",
  recruiterSchema
);

export default Recruiter;
