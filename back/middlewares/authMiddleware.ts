/* js -> ts
req.user, req.decoded처럼 커스텀 속성 추가에 대한 타입 확장
jsonwebtoken, mongoose, express 타입 패키지 필요
Recruiter 모델 타입을 가져와 검증된 유저 타입 지정
*/
// 클라이언트가 인증 필수 페이지에 접근하고자 토큰 검증 요청 보냄.
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Recruiter, { RecruiterDocument } from "../models/Recruiter";

dotenv.config();

// 토큰 페이로드 타입 정의
export interface JwtPayload {
  userEmail: string;
  iat?: number;
  exp?: number;
}

// Request 타입 확장
export interface AuthenticatedRequest extends Request {
  user?: RecruiterDocument;
  decoded?: JwtPayload;
}

// JWT 인증 미들웨어
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  //console.log("authMiddleware 실행됨");

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!authHeader) {
    res
      .status(401)
      .json({ message: "헤더가 없습니다. 인증이 거부되었습니다." });
    return;
  }

  if (!token) {
    res
      .status(401)
      .json({ message: "토큰이 없습니다. 인증이 거부되었습니다." });
    return;
  }

  // JWT 토큰 검증
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await Recruiter.findOne({ email: decoded.userEmail });

    if (!user) {
      res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    req.decoded = decoded;
    req.user = user; // 요청 객체에 사용자 정보 추가
    next(); // 다음 미들웨어로 이동
  } catch (err) {
    console.error("토큰 검증 오류:", err);
    res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

export default authMiddleware;
