import mongoose, { Document, Schema, Model } from "mongoose";

// Career 문서 타입 정의
export interface CareerDocument extends Document {
  resume_id: mongoose.Types.ObjectId;
  company_name?: string;
  position?: string;
  description?: string;
  start_year?: string;
  isCurrent?: boolean;
  end_year?: string;
}

// 스키마 정의
const careerSchema: Schema<CareerDocument> = new Schema({
  resume_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  company_name: { type: String },
  position: { type: String },
  description: { type: String },
  start_year: { type: String },
  isCurrent: { type: Boolean },
  end_year: {
    type: String,
    validate: {
      validator: function (value: string) {
        return !value || /^\d{6}$/.test(value); // null 허용 or 6자리 숫자
      },
    },
  },
});

// 모델 생성
const Career: Model<CareerDocument> = mongoose.model<CareerDocument>(
  "Career",
  careerSchema
);

export default Career;
