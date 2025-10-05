import mongoose, { Document, Schema, Model } from "mongoose";

// Certificate 문서 타입 정의
export interface CertificateDocument extends Document {
  resume_id: mongoose.Types.ObjectId;
  certificate_name: string;
  issued_date: Date;
  certificate_number: string;
}

// 스키마 정의
const certificateSchema: Schema<CertificateDocument> = new Schema({
  resume_id: {
    type: Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  certificate_name: { type: String, required: true },
  issued_date: { type: Date, required: true },
  //issuing_org: { type: String, required: true },
  certificate_number: { type: String, required: true },
});

const Certificate: Model<CertificateDocument> =
  mongoose.model<CertificateDocument>("Certificate", certificateSchema);

export default Certificate;
