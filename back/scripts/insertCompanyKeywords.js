const fs = require("fs");
const path = require("path");
const db = require("../config/db"); // DB 연결 모듈 불러오기
const CompanyKeyword = require("../models/CompanyKeyword");

const inputDir = path.resolve(__dirname, "../output_json");
// 카테고리 매핑

const keywordDescriptions = {
  Teamculture:
    "구성원 간 상호 존중과 소통을 중시하는 환경으로, 직급과 무관하게 자유롭게 의견을 제시하고 협업할 수 있는 수평적인 문화를 갖추고 있습니다. 신입사원도 빠르게 적응할 수 있는 따뜻하고 열린 분위기가 특징입니다.",

  Evaluation:
    "성과와 역량에 기반한 공정한 평가 시스템을 운영하고 정기적인 피드백과 리뷰를 통해 직원들이 성장할 수 있도록 돕습니다. 멘토링 제도, 사내 교육 프로그램, 외부 연수 등 다양한 경로로 개인의 성장을 지원하고 있습니다.",

  "Pay Level":
    "시장 대비 경쟁력 있는 연봉 체계와 성과 기반 인센티브를 제공하여 구성원들의 동기를 부여하고, 우수한 인재를 유치하기 위한 보상 시스템을 운영하고 있습니다. 연봉 이외에도 다양한 성과급 제도와 복지 포인트를 통해 금전적 만족도를 높이고 있습니다.",

  "Vision & Direction":
    "경영진의 명확한 비전과 전략 아래 장기적인 성장 방향이 설정되어 있으며, 구성원들과 지속적으로 공유됩니다. 정기적인 타운홀 미팅, 뉴스레터 등을 통해 회사의 목표와 방향성을 명확하게 전달하고 있습니다.",
  "Welfare Quality":
    "직원들의 삶의 질 향상을 위한 다양한 복지 혜택을 제공하고 있으며, 유연근무제, 사내 식당, 헬스케어 지원, 가족 친화 정책 등 실질적인 복지를 통해 만족도를 높이고 있습니다.",

  Workload:
    "업무 강도는 직무와 부서에 따라 다를 수 있으나, 전체적으로는 워라밸(Work-Life Balance)을 지향하는 문화를 추구합니다. 불필요한 야근은 지양하고, 업무 효율성을 높이기 위한 프로세스를 지속적으로 개선하고 있습니다.",
};

const categoryMap = {
  Teamculture: "Teamculture",
  Evaluation: "Evaluation",
  "Pay Level": "Pay Level",
  "Vision & Direction": "Vision & Direction",
  "Welfare Quality": "Welfare Quality",
  Workload: "Workload",
};

async function insertKeywordsFromFiles() {
  await db.connect(); // DB 연결

  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const rawData = fs.readFileSync(filePath, "utf-8");
    const keywordData = JSON.parse(rawData);

    const companyName = file.replace("_category_summary.json", "");

    for (const entry of keywordData) {
      const rawCategory = entry.category_name;
      const category = categoryMap[rawCategory];

      if (!category) {
        console.log(`존재하지 않는 카테고리 "${rawCategory}" in file ${file}`);
        continue;
      }

      const newKeyword = new CompanyKeyword({
        company_name: companyName,
        category: category,
        score: parseFloat(entry.average_score.toFixed(2)),
        count: entry.count,
        description: keywordDescriptions[category] || "",
        comments: Array.isArray(entry.comments) ? entry.comments : [],
      });

      try {
        await newKeyword.save();
        console.log(`저장 완료! : ${companyName} - ${category}`);
      } catch (err) {
        console.error(`에러 발생 : ${companyName} - ${category}:`, err.message);
      }
    }
  }

  // 종료
  await db.disconnect();
  console.log("database disconnected");
}

insertKeywordsFromFiles();
