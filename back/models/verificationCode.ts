import mongoose, { Document, Schema, Model } from "mongoose";

// VerificationCode 문서 타입 정의
export interface VerificationCodeDocument extends Document {
  phone: string;
  verify_code: string;
  expires_at: Date;
  is_verified: boolean;
}

// 스키마 정의
const verificationCodeSchema: Schema<VerificationCodeDocument> = new Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{3}-?\d{4}-?\d{4}$/, "올바른 전화번호 형식이 아닙니다."],
  },
  verify_code: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
});

// 모델 정의
const VerificationCode: Model<VerificationCodeDocument> =
  mongoose.model<VerificationCodeDocument>(
    "VerificationCode",
    verificationCodeSchema
  );

export default VerificationCode;
