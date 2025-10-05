import mongoose, { Document, Schema, Model } from "mongoose";

// 타입 정의
export type Degree =
  | "대학교(4년 이상)"
  | "대학원(석사)"
  | "대학원(박사)"
  | "대학교(2,3년)"
  | "고등학교"
  | "중학교"
  | "초등학교"
  | "";

export type GraduationStatus = "졸업" | "재학" | "수료" | "중퇴" | "휴학";

// Education 문서 타입 정의
export interface EducationDocument extends Document {
  resume_id: mongoose.Types.ObjectId;
  school_name?: string;
  major?: string;
  degree: Degree;
  graduation_status?: GraduationStatus;
  exam_passed: boolean;
}

// 스키마 정의
const educationSchema: Schema<EducationDocument> = new Schema({
  resume_id: {
    type: Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  school_name: { type: String },
  major: { type: String },
  degree: {
    type: String,
    enum: [
      "대학교(4년 이상)",
      "대학원(석사)",
      "대학원(박사)",
      "대학교(2,3년)",
      "고등학교",
      "중학교",
      "초등학교",
      "",
    ],
    default: "",
  },
  graduation_status: {
    type: String,
    enum: ["졸업", "재학", "수료", "중퇴", "휴학"],
  },
  exam_passed: {
    type: Boolean,
    default: false,
  },
});

const Education: Model<EducationDocument> = mongoose.model<EducationDocument>(
  "Education",
  educationSchema
);

export default Education;
