import mongoose, { Document, Schema, Model } from "mongoose";

// EmailVerificationCode 문서 타입 정의
export interface EmailVerificationCodeDocument extends Document {
  email: string;
  verify_code: string;
  expires_at: Date;
  is_verified: boolean;
}

// 스키마 정의
const emailVerificationCodeSchema: Schema<EmailVerificationCodeDocument> =
  new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "올바른 이메일 형식이 아닙니다."],
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
const EmailVerificationCode: Model<EmailVerificationCodeDocument> =
  mongoose.model<EmailVerificationCodeDocument>(
    "EmailVerificationCode",
    emailVerificationCodeSchema
  );

export default EmailVerificationCode;
