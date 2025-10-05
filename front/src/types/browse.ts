export interface CareerItem {
  start_year: string;
  end_year?: string;
}

export interface EducationItem {
  degree: string;
}

export interface CompanyTest {
  scores: {
    Evaluation: number;
    PayLevel: number;
    VisionDirection: number;
    Welfare: number;
    Workload: number;
  };
}

export interface Skill {
  skill_name: string;
}

export interface CandidateType {
  name: string;
  age: number;
  gender: string;
  keyword: string[];
  skills?: Skill[];
  career?: CareerItem[];
  education?: EducationItem[];
  companyTest?: CompanyTest;
  resume_id: string;
  wishlist?: string[];
}
