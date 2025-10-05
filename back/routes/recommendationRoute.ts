import express from "express";
import {
  StrengthRecommendCandidate,
  KeywordRecommendCandidate,
} from "../controllers/recommendationController";

const router = express.Router();

// 인재 강점 기반 후보자 추천
router.post("/candidate", StrengthRecommendCandidate);

// 기업 이미지 기반 후보자 추천
router.get("/candidate/:companyName", KeywordRecommendCandidate);

export default router;
