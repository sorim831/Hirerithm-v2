import dotenv from "dotenv";
dotenv.config(); // 환경 변수 로드

import express, { Request, Response, NextFunction } from "express";
import authRoutes from "./routes/authRoute";
import companyRoutes from "./routes/companyRoute";
import resumeRoutes from "./routes/resumeRoute";
import recommendationRoutes from "./routes/recommendationRoute";
import { db } from "./config/db"; // DB 연결 모듈 불러오기

const app = express();

import bodyParser from "body-parser";
import path from "path"; // path 모듈 추가

import cors from "cors";
app.use(cors()); // 모든 출처를 허용

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우팅 설정
app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/resume", resumeRoutes);
app.use("/recommendation", recommendationRoutes);

// 에러 핸들링 미들웨어
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("서버 오류:", err.stack);
  res.status(500).send("서버에서 오류가 발생했습니다(server.ts).");
});

/*
// DB 연결
await db();

// 서버 실행
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
*/

// 정적 파일 설정 (public 폴더)
app.use(express.static(path.join(__dirname, "public")));

(async () => {
  try {
    await db();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error("DB 연결 실패:", err);
  }
})();
