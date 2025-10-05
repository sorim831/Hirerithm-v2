import express, { Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Recruiter";
import * as authController from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

// 회원가입 엔드포인트
router.post("/signup", authController.register);

// 로그인 엔드포인트
router.post("/login", authController.login);

// 아이디 중복 체크 엔드포인트
router.post("/check-id", authController.checkIdAvailability);
//router.get("/check-id", authController.checkIdAvailability); // 임시로 추가
// 인증번호 전송 엔드포인트
router.get("/send-verification", authController.sendVerifynumber);
router.get("/send-email-verification", authController.sendEmailVerifynumber);

// 인증번호 검증
router.post("/check-verify-code", authController.checkVerifyCode);

// 아이디 찾기
router.post("/find-id", authController.findId);

// 비밀번호 찾기
router.get("/find-password", authController.findPassword);

// 비밀번호 재설정
router.post("/reset-password", authController.resetPassword);

// 토큰 검증
router.get("/verify", authMiddleware, authController.verifyToken);

router.post(
  "/get-user",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userEmail = req.body.email;
      const user = await User.findOne({ email: userEmail });

      if (!user) {
        res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      res.status(500).json({ message: "서버 오류" });
    }
  }
);

router.put("/update-user", authMiddleware, authController.updateUser);

export default router;
