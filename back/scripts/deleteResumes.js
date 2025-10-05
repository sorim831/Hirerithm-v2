const mongoose = require("mongoose");
const db = require("../config/db"); // DB 연결 모듈 불러오기
const Resume = require("../models/Resume");
const Education = require("../models/Education");
const Career = require("../models/Career");
const Certificate = require("../models/Certificate");
const Skills = require("../models/Skills");
const OtherInfo = require("../models/OtherInfo");
const CompanyTest = require("../models/CompanyTest");

async function deleteResumes() {
  await db.connect(); // DB 연결
  try {
    // keyword가 비어 있는 Resume 조회
    const resumesToDelete = await Resume.find({ keyword: { $size: 0 } });

    for (const resume of resumesToDelete) {
      const resumeId = resume._id;
      // 관련된 모든 문서 삭제
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
  } catch (error) {
    console.error(error);
  } // 종료
  await db.disconnect();
  console.log("database disconnected");
}

deleteResumes();
