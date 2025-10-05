import mongoose, { Document, Schema, Model } from "mongoose";

// 성별 타입 정의
export type Gender = "남성" | "여성";

// Resume 문서 타입 정의
export interface ResumeDocument extends Document {
  resume_id: mongoose.Types.ObjectId;
  name: string;
  filePath: string;
  keyword: string[];
  birth_date: Date;
  age?: number;
  gender: Gender;
  address: string;
  phone: string;
  current_salary?: number;
  desired_salary?: number;
  wishlist: string[];
  createdAt: Date;
}

// 스키마 정의
const resumeSchema: Schema<ResumeDocument> = new Schema({
  // 고유 아이디
  resume_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  // 구직자 이름
  name: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  keyword: {
    type: [String],
    default: [],
  },
  birth_date: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["남성", "여성"],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  current_salary: {
    type: Number,
  },
  desired_salary: {
    type: Number,
  },
  wishlist: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

// birth_date로 나이 계산하는 함수 추가
resumeSchema.pre<ResumeDocument>("save", function (next) {
  if (this.birth_date) {
    const birthDate = new Date(this.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }
    this.age = age;
  }
  next();
});

// 모델 정의
const Resume: Model<ResumeDocument> = mongoose.model<ResumeDocument>(
  "Resume",
  resumeSchema
);

export default Resume;
