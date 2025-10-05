import mongoose, { Document, Schema, Model } from "mongoose";

// Skills 문서 타입 정의
export interface SkillDocument extends Document {
  resume_id: mongoose.Types.ObjectId;
  skill_name?: string;
}

// 스키마 정의
const skillSchema: Schema<SkillDocument> = new Schema({
  resume_id: {
    type: Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  skill_name: {
    type: String,
  },
});

// 모델 생성
const Skills: Model<SkillDocument> = mongoose.model<SkillDocument>(
  "Skills",
  skillSchema
);

export default Skills;
