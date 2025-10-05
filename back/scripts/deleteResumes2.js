const mongoose = require("mongoose");
const db = require("../config/db"); // DB 연결 모듈 불러오기
const Resume = require("../models/Resume");
const Education = require("../models/Education");
const Career = require("../models/Career");
const Certificate = require("../models/Certificate");
const Skills = require("../models/Skills");
const OtherInfo = require("../models/OtherInfo");
const CompanyTest = require("../models/CompanyTest");

async function deleteResumes2() {
  await db.connect();

  try {
    // 이름 기준 중복 그룹 찾기
    const duplicates = await Resume.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          ids: { $push: "$_id" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    for (const dup of duplicates) {
      const { ids } = dup;
      const [keepId, ...removeIds] = ids;

      for (const resumeId of removeIds) {
        // 관련 문서 삭제
        await Promise.all([
          Education.deleteMany({ resume_id: resumeId }),
          Career.deleteMany({ resume_id: resumeId }),
          Certificate.deleteMany({ resume_id: resumeId }),
          Skills.deleteMany({ resume_id: resumeId }),
          OtherInfo.deleteMany({ resume_id: resumeId }),
          CompanyTest.deleteMany({ resume_id: resumeId }),
          Resume.deleteOne({ _id: resumeId }),
        ]);
      }

      console.log(
        `✔ 이름 '${dup._id}' 중복 이력서 중 ${removeIds.length}개 삭제 완료 (남긴 ID: ${keepId})`
      );
    }

    console.log("✅ 중복 이력서 및 관련 문서 정리 완료");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await db.disconnect();
    console.log("📴 DB 연결 종료");
  }
}
deleteResumes2();
