import mongoose, { Document, Schema, Model } from "mongoose";

// category 필드의 enum 타입을 타입스크립트 레벨에서도 보장
export type CompanyCategory =
  | "Teamculture"
  | "Evaluation"
  | "Pay Level"
  | "Vision & Direction"
  | "Welfare Quality"
  | "Workload";

// CompanyKeyword 문서 타입 정의
export interface CompanyKeywordDocument extends Document {
  company_name: string;
  category: CompanyCategory;
  description?: string;
  score: number;
  count: number;
  comments: string[];
}

// 스키마 정의
const companyKeywordSchema: Schema<CompanyKeywordDocument> = new Schema({
  company_name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Teamculture",
      "Evaluation",
      "Pay Level",
      "Vision & Direction",
      "Welfare Quality",
      "Workload",
    ],
  },
  description: {
    type: String,
    default: "",
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    default: 0,
  },
  count: {
    type: Number,
    default: 0,
  },
  comments: {
    type: [String],
    default: [],
  },
});

const CompanyKeyword: Model<CompanyKeywordDocument> =
  mongoose.model<CompanyKeywordDocument>(
    "CompanyKeyword",
    companyKeywordSchema
  );

export default CompanyKeyword;
