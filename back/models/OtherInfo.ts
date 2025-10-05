import mongoose, { Document, Schema, Model } from "mongoose";

// OtherInfo 문서 타입 정의
export interface OtherInfoDocument extends Document {
  resume_id: mongoose.Types.ObjectId;
  content: string;
}

// 스키마 정의
const otherInfoSchema: Schema<OtherInfoDocument> = new Schema({
  resume_id: {
    type: Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

// 모델 생성
const OtherInfo: Model<OtherInfoDocument> = mongoose.model<OtherInfoDocument>(
  "OtherInfo",
  otherInfoSchema
);

export default OtherInfo;
