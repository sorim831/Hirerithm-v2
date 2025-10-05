import type { ChangeEvent } from "react";
import "../browse.css";

interface CareerFilterBarProps {
  selectedCareer: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const CareerFilterBar = ({
  selectedCareer,
  onChange,
}: CareerFilterBarProps) => {
  return (
    <select className="filter-btn" value={selectedCareer} onChange={onChange}>
      <option>경력 무관</option>
      <option>신입</option>
      <option>1-5년</option>
      <option>6-10년</option>
      <option>11-15년</option>
      <option>16-19년</option>
      <option>20년 이상</option>
    </select>
  );
};

export default CareerFilterBar;
