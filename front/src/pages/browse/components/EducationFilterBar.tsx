import type { ChangeEvent } from "react";
import "../browse.css";

interface EducationFilterBarProps {
  selectedEducation: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const EducationFilterBar = ({
  selectedEducation,
  onChange,
}: EducationFilterBarProps) => {
  return (
    <select
      className="filter-btn"
      value={selectedEducation}
      onChange={onChange}
    >
      <option>학력 무관</option>
      <option>초등학교 졸업 이상</option>
      <option>중학교 졸업 이상</option>
      <option>고등학교 졸업 이상</option>
      <option>학사 학위 이상</option>
      <option>석사 학위 이상</option>
      <option>박사 학위 이상</option>
    </select>
  );
};

export default EducationFilterBar;
