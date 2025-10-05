import express from "express";
import {
  getCompanyKeywords,
  getCompanyAutoSearch,
} from "../controllers/companyController";
const router = express.Router();

// 기업 키워드 조회 엔드포인트
router.get("/:companyName/keyword", getCompanyKeywords);

// 기업 자동 완성 엔드포인트
router.get("/autosearch", getCompanyAutoSearch);

export default router;
