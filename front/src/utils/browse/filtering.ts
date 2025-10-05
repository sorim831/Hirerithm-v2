import type {
  CareerItem,
  EducationItem,
  CompanyTest,
  CandidateType,
} from "../../types/browse";

/* 경력 리스트를 기반으로 총 경력 연차를 계산 */
export const calculateExperienceYears = (careerList?: CareerItem[]): number => {
  if (!careerList || careerList.length === 0) return 0;
  const totalMonths = careerList.reduce((sum, item) => {
    const start = new Date(item.start_year);
    const end = new Date(item.end_year || new Date());
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return sum + (months > 0 ? months : 0);
  }, 0);
  return Math.floor(totalMonths / 12);
};

/* 학력 필터 조건을 만족하는지 여부 판단 */
export const passesEducationFilter = (
  educationList: EducationItem[] | undefined,
  selectedEducation: string
): boolean => {
  if (selectedEducation === "학력 무관") return true;

  const degreeOrder: Record<string, number> = {
    초등학교: 1,
    중학교: 2,
    고등학교: 3,
    학사: 4,
    석사: 5,
    박사: 6,
  };

  const required =
    {
      무관: 0,
      "초등학교 졸업 이상": 1,
      "중학교 졸업 이상": 2,
      "고등학교 졸업 이상": 3,
      "학사 학위 이상": 4,
      "석사 학위 이상": 5,
      "박사 학위 이상": 6,
    }[selectedEducation] ?? 0;

  if (!educationList || educationList.length === 0) return false;

  const maxDegree = Math.max(
    ...educationList.map((e) => degreeOrder[e.degree] || 0)
  );

  return maxDegree >= required;
};

/* 맞춤기업 유형 필터 조건을 만족하는지 여부 판단 */
export const passesCompanyTypeFilter = (
  companyTest: CompanyTest | undefined,
  selectedCompanyType: string
): boolean => {
  if (selectedCompanyType === "맞춤기업 TEST 결과 유형 무관") return true;
  if (!companyTest || !companyTest.scores) return false;

  const scoreMap = {
    "평가 및 성장 가능성 강점 기업 인재": companyTest.scores.Evaluation,
    "높은 보상 강점 기업 인재": companyTest.scores.PayLevel,
    "비전 및 방향성 강점 기업 인재": companyTest.scores.VisionDirection,
    "복지 강점 기업 인재": companyTest.scores.Welfare,
    "업무 강도 강점 기업 인재": companyTest.scores.Workload,
  };

  const highestType = Object.entries(scoreMap).reduce((max, cur) => {
    return cur[1] > max[1] ? cur : max;
  })[0];

  return selectedCompanyType === highestType;
};

/* 이름 또는 기술 스택에 검색 키워드가 포함되는지 여부 판단 */
export const passesSearchFilter = (
  candidate: CandidateType,
  searchKeyword: string
): boolean => {
  const keyword = searchKeyword.trim().toLowerCase();
  if (!keyword) return true;

  const nameMatch = candidate.name?.toLowerCase().includes(keyword) ?? false;
  const skillMatch =
    candidate.skills?.some((s) =>
      s.skill_name?.toLowerCase().includes(keyword)
    ) ?? false;

  return nameMatch || skillMatch;
};
