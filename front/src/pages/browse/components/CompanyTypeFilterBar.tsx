import type { ChangeEvent } from "react";
import "../browse.css";

interface CompanyTypeFilterBarProps {
  selectedCompanyType: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const CompanyTypeFilterBar = ({
  selectedCompanyType,
  onChange,
}: CompanyTypeFilterBarProps) => {
  return (
    <select
      className="filter-btn"
      value={selectedCompanyType}
      onChange={onChange}
    >
      <option>맞춤기업 TEST 결과 유형 무관</option>
      <option>평가 및 성장 가능성 강점 기업 인재</option>
      <option>높은 보상 강점 기업 인재</option>
      <option>비전 및 방향성 강점 기업 인재</option>
      <option>복지 강점 기업 인재</option>
      <option>업무 강도 강점 기업 인재</option>
    </select>
  );
};

export default CompanyTypeFilterBar;
