import mongoose, { Document, Schema, Model } from "mongoose";

// scores 필드 내부 구조를 명확히 분리하여 타입 정의
export interface CompanyTestScores {
  [key: string]: number; // key로 접근 가능하도록
  TeamCulture: number;
  Evaluation: number;
  PayLevel: number;
  VisionDirection: number;
  Welfare: number;
  Workload: number;
}

// CompanyTest 문서 타입 정의
export interface CompanyTestDocument extends Document {
  resume_id: mongoose.Types.ObjectId;
  scores: CompanyTestScores;
}

// 스키마 정의
const companyTestSchema: Schema<CompanyTestDocument> = new Schema({
  resume_id: {
    type: Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  scores: {
    TeamCulture: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    Evaluation: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    PayLevel: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    VisionDirection: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    Welfare: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    Workload: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
});

const CompanyTest: Model<CompanyTestDocument> =
  mongoose.model<CompanyTestDocument>("CompanyTest", companyTestSchema);

export default CompanyTest;
