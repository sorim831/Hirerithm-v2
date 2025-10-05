import dotenv from "dotenv";

dotenv.config(); // 환경변수 가장 먼저 불러오기

import puppeteer from "puppeteer";
import { Request, Response } from "express";
import path from "node:path";
import Resume, { ResumeDocument } from "../models/Resume";
import Education, { EducationDocument } from "../models/Education";
import Career, { CareerDocument } from "../models/Career";
import Certificate, { CertificateDocument } from "../models/Certificate";
import Skills, { SkillDocument } from "../models/Skills";
import OtherInfo, { OtherInfoDocument } from "../models/OtherInfo";

import CompanyTest, { CompanyTestDocument } from "../models/CompanyTest";
import CompanyKeyword, {
  CompanyKeywordDocument,
} from "../models/CompanyKeyword";
//const Wishlist = require("../models/Wishlist");
//const { v4: uuidv4 } = require("uuid");

import OpenAI from "openai";

// 환경변수 제대로 들어있는지 확인

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY가 .env에서 로드되지 않았습니다!");
  process.exit(1);
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 추천 후보차 생성
export const StrengthRecommendCandidate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { required, preferred, etc } = req.body;

    // 초안 : 요구사항 부분을 gpt한데 db 검색(skills)하는 코드를 짜게 해서 그 결과로 일단 1차 필터링
    const queryInstruction = `
[필수 사항]
${required}

[우대 사항]
${preferred}

위 내용을 기반으로 MongoDB 쿼리의 조건식을 만들어줘. 조건은 "skills" 콜렉션을 대상으로 하며, "skill_name" 필드를 기준으로 포함 여부를 판단해줘.
MongoDB filter 객체 형식(JSON)으로 출력해줘. 예: { "skill_name": { "$in": ["java", "python"] } }

단, 내용이 문장이라면 중요한 기술 키워드만 추출해서 사용해줘. 예를 들어 "zustand를 통한 상태관리 경험" → "zustand"
    `;

    const queryResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "너는 Node.js와 MongoDB를 잘 아는 백엔드 개발자야. 사용자 요구사항을 기반으로 적절한 필터 조건을 만드는 역할이야.",
        },
        { role: "user", content: queryInstruction },
      ],
      temperature: 0.2,
    });

    let queryFilter;
    const queryText = queryResponse.choices[0].message.content;
    if (!queryText) {
      console.error("GPT 응답 오류 : content가 null입니다.");
      res.status(500).json({ success: false, message: "GPT 응답 오류: content가 null입니다." });
      return;
    }
    try {
      queryFilter = JSON.parse(queryText);
    } catch (e) {
      console.error("GPT 응답 JSON 파싱 실패 (필터):", queryText);
      res.status(500).json({ success: false, message: "GPT 필터 응답 오류" });
      return;
    }

    console.log("GPT 기반 필터 조건:", queryFilter);

    // 이력서 필터링
    //const resumes = await Resume.find();
    //const resumeData = [];
    const filteredResumes = await Skills.find(queryFilter).distinct(
      "resume_id"
    );
    const resumes = await Resume.find({ resume_id: { $in: filteredResumes } });

    // 이력서 준비
    const resumeData = await Promise.all(
      resumes.map(async (resume) => {
        const skills = await Skills.find({ resume_id: resume.resume_id });
        const education = await Education.find({ resume_id: resume.resume_id });
        const career = (await Career.find({
          resume_id: resume.resume_id,
        })) as CareerDocument[];

        return {
          resume_id: resume.resume_id,
          name: resume.name,
          keyword: resume.keyword || [],
          skills: skills.map((s) => s.skill_name), // skill_name만 추출
          career: career.map((c) => ({
            company: c.company_name,
            position: c.position,
            startDate: c.start_year,
            endDate: c.end_year,
            description: c.description,
          })),
        };
      })
    );

    // TODO : 프롬프트 수정
    const gptInput = `
[회사 정보]
- 필수 사항: ${required}
- 우대 사항: ${preferred}
- 기타: ${etc}

위 내용을 바탕으로 회사가 중요하게 여기는 핵심 키워드(recruiter_keyword)를 정확히 3개 추출해줘. 예시: ["경력", "매출 성장 기여", "Node.js"]

[이력서 목록]
${resumeData
  .map(
    (r, i) =>
      `${i + 1}. resume_id: ${r.resume_id}, 이름: ${r.name}
- 대표 키워드: [${r.keyword.join(", ")}]
- 기술: [${r.skills.join(", ")}]
- 경력: ${r.career
        .map(
          (c) => `${c.company} (${c.position}, ${c.startDate} ~ ${c.endDate})`
        )
        .join("; ")}`
  )
  .join("\n")}

[점수 계산 기준]
각 이력서에 대해 아래 항목을 기준으로 0.0 ~ 5.0 사이의 score를 계산해줘. 점수는 반드시 아래 수식을 따르고, 이탈하지 마.:

1. 필수 조건 충족: 최대 2.0점  
   - 필수 조건이 N개라면, 조건 1개 충족 시 2.0 / N 점을 부여

2. 우대 조건 충족: 최대 1.0점  
   - 우대 조건이 M개라면, 조건 1개 충족 시 1.0 / M 점을 부여

3. 관련 기술(skill_name) 일치율: 최대 1.0점  
   - 요구 기술 T개 중 일치하는 기술 수를 C라 할 때, 기술 점수 = (C / T) * 1.0

4. 키워드 및 경력 적합도 (최대 1.0점):
- 키워드 및 경력 서술을 기준으로 아래와 같이 점수를 부여
  - 매우 잘 부합: 1.0점
  - 일부 부합: 0.5점
  - 거의 부합하지 않음: 0.0점

※ 모든 점수는 반드시 소수점 첫째 자리까지 반올림해서 표현해줘.
※ 점수는 위 수식에 기반해 계산된 값이어야 하며, 지원자 간 차별성을 위해 지원자 간 점수 편차를 반드시 만들 것. 총점이 동일한 경우가 2명 이상 있으면 안 됨.

위 이력서 목록 중, 회사의 요구조건에 가장 부합하는 후보자 6명을 추천해줘. 
반드시 위 목록에 있는 후보자만 사용할 것. 아래 JSON 형식으로 출력해줘.

[응답 형식] 예시:
{
  "recommendations": [
    {
      "name": "홍길동",
      "resume_id": "...",
      "resume_keyword": [resume_id에 해당하는 keyword 목록],
      "recruiter_keyword": [회사가 중요하게 여기는 핵심 키워드],"recruiter_keyword_description": {
        "경력": "다양한 직무 경험과 지속적인 업무 수행을 통해 쌓은 전문성이 돋보입니다.",
        "React": "React를 활용한 프로젝트를 주도적으로 수행하며 UI 개발에 대한 이해도가 높습니다.",
        "글로벌 역량": "해외 기업과 협업하거나 다문화 환경에서 일한 경험이 국제적 소통 능력으로 나타납니다."
        ...
      },
      "reason": "...",
      "score": 0.0 ~ 5.0,
      "score_detail": {
        "필수 조건": 1.5,
        "우대 조건": 0.5,
        "기술 일치율": 0.8,
        "키워드/경력 적합도": 1.0
      }
    }
  ]
}
→ 반드시 위 resume 목록 중 최대 6명만 추천해.
→ JSON 형식을 반드시 지켜줘.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "너는 채용 매니저야. 기업의 채용 조건에 맞는 적절한 이력서를 추천하는 것이 역할이야.",
        },
        {
          role: "user",
          content: gptInput,
        },
      ],
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0].message.content;
    
    if (!gptResponse) {
      console.error("GPT 응답 오류 : content가 null입니다.");
      res.status(500).json({ success: false, message: "GPT 응답 오류: content가 null입니다." });
      return;
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(gptResponse);
    } catch (e) {
      console.error("GPT 응답 JSON 파싱 실패:", gptResponse);
      res.status(500).json({ success: false, message: "GPT 추천 응답 오류" });
      return;
    }

    // 최대 6명까지만 응답
    parsedResponse.recommendations =
      parsedResponse.recommendations &&
      Array.isArray(parsedResponse.recommendations)
        ? parsedResponse.recommendations.slice(0, 5)
        : [];

    console.log(parsedResponse);

    res.status(200).json(parsedResponse);
    return;
  } catch (err) {
    console.error("후보자 추천 오류:", (err as Error).stack);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

interface CategoryScoreMap {
  [key: string]: number;
}

interface TestScore {
  [key: string]: number;
}

export const KeywordRecommendCandidate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { companyName } = req.params;

    const categoryMapping = {
      Teamculture: "TeamCulture",
      Evaluation: "Evaluation",
      "Pay Level": "PayLevel",
      "Vision & Direction": "VisionDirection",
      "Welfare Quality": "Welfare",
      Workload: "Workload",
    };

    // 해당 회사 키워드 점수 불러오기
    const keywords = await CompanyKeyword.find({
      company_name: new RegExp(`^${companyName}$`, "i"), // 대소문자 무시
    });

    if (!keywords || keywords.length === 0) {
      res
        .status(404)
        .json({ message: "해당 회사의 키워드를 찾을 수 없습니다." });
      return;
    }
    // 점수 매핑
    const scoreMap: CategoryScoreMap = {};
    keywords.forEach((k) => {
      const mappedKey = categoryMapping[k.category];
      //console.log(mappedKey);
      if (mappedKey && typeof k.score === "number") {
        scoreMap[mappedKey] = k.score;
      }
    });

    // 모든 CompanyTest 불러오고, 이력서 포함
    const tests = await CompanyTest.find().populate("resume_id").exec();
    const typedTests = tests as unknown as (Document &
      CompanyTestDocument & { resume_id: ResumeDocument })[];

    // 각 지원자에 대해 유사도 점수 계산
    const result = typedTests.map((test) => {
      const { resume_id, scores } = test;
      //console.log(test);
      let totalSimilarity = 0;
      let count = 0;

      Object.keys(scores).forEach((key) => {
        const companyScore = scoreMap[key];
        const applicantScore = scores[key];

        if (
          typeof companyScore === "number" &&
          typeof applicantScore === "number" &&
          isFinite(companyScore) &&
          isFinite(applicantScore)
        ) {
          const similarity = 5 - Math.abs(companyScore - applicantScore);
          totalSimilarity += similarity;
          count++;
        }
      });

      const averageScore = count > 0 ? totalSimilarity / count : 0;
      return {
        resume: resume_id,
        compatibilityScore: parseFloat(averageScore.toFixed(2)), // 숫자로 유지
      };
    });

    // 점수 내림차순 정렬
    const result_top5 = result
      .sort(
        (a, b) => Number(b.compatibilityScore) - Number(a.compatibilityScore)
      )
      .slice(0, 5);

    res.json(result_top5);
  } catch (err) {
    console.error("후보자 추천 오류:", (err as Error).stack);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};
