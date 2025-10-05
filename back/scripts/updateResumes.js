const mongoose = require("mongoose");
const db = require("../config/db"); // DB 연결 모듈
const Resume = require("../models/Resume");

async function updateResumes() {
  await db.connect(); // DB 연결
  try {
    const result = await Resume.updateMany(
      { wishlist: { $exists: false } }, // wishlist 필드가 없는 경우
      { $set: { wishlist: [] } } // 빈 배열로 초기화
    );

    console.log(
      `${result.modifiedCount}개의 resume 문서가 업데이트되었습니다.`
    );
  } catch (error) {
    console.error("업데이트 중 오류 발생:", error);
  }

  await db.disconnect(); // DB 연결 종료
  console.log("database disconnected");
}

updateResumes();
