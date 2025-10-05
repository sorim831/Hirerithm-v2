import { useState, useEffect } from "react";
import axios from "axios";
import "./browse.css";
import type { CandidateType } from "../../types/browse";

import {
  calculateExperienceYears,
  passesEducationFilter,
  passesCompanyTypeFilter,
  passesSearchFilter,
} from "../../utils/browse/filtering";

import MemberNavigation from "../../components/MemberNavigation";
import CareerFilterBar from "./components/CareerFilterBar";
import EducationFilterBar from "./components/EducationFilterBar";
import CompanyTypeFilterBar from "./components/CompanyTypeFilterBar";
import DBItem from "./components/DBItem";
import ProfileDetail from "./components/ProfileDetail";

import FileLogo from "../../assets/icon/FileLogo.svg";
import SearchIcon from "../../assets/icon/SearchIcon.svg";
import RefreshIcon from "../../assets/icon/RefreshIcon.svg";

const Browse = () => {
  const [candidateData, setCandidateData] = useState<CandidateType[]>([]);
  const [sortType, setSortType] = useState<"latest" | "popular">("latest");
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHoveringRefresh, setIsHoveringRefresh] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>("경력 무관");
  const [selectedEducation, setSelectedEducation] =
    useState<string>("학력 무관");
  const [selectedCompanyType, setSelectedCompanyType] =
    useState<string>("맞춤기업 TEST 결과 유형 무관");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const userEmail = localStorage.getItem("email") || "";

  const BACK_URL = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    getCandidateList();
  }, []);

  const getCandidateList = () => {
    setIsLoading(true);
    let url = `${BACK_URL}/resume/list`;
    if (sortType === "popular") {
      url = `${BACK_URL}/resume/wishlist/sort/popular`;
    } else if (sortType === "latest") {
      url = `${BACK_URL}/resume/wishlist/sort/latest`;
    }
    axios
      .get(url)
      .then((res) => {
        setCandidateData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("후보자 데이터 가져오기 에러:", err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(
          `${BACK_URL}/resume/wishlist/${userEmail}`
        );
        const wishedIds = response.data.map(
          (resume: { resume_id: string }) => resume.resume_id
        );
        setWishlist(wishedIds);
        console.log("찜한 후보자 resume_id 리스트:", wishedIds);
      } catch (error) {
        console.error("찜 목록 불러오기 실패:", error);
      }
    };

    fetchWishlist();
  }, [userEmail]);

  const handleCandidateClick = (candidate: CandidateType) => {
    setSelectedCandidate(candidate);
    setDetailModalOpen(true);
  };

  const filteredCandidates = candidateData.filter((candidate) => {
    const years = calculateExperienceYears(candidate.career);
    const educationOk = passesEducationFilter(
      candidate.education,
      selectedEducation
    );
    const companyTypeOk = passesCompanyTypeFilter(
      candidate.companyTest,
      selectedCompanyType
    );
    const searchOk = passesSearchFilter(candidate, searchKeyword);

    const careerPass = (() => {
      if (selectedCareer === "경력 무관") return true;

      switch (selectedCareer) {
        case "신입":
          return years === 0;
        case "1-5년":
          return years >= 1 && years <= 5;
        case "6-10년":
          return years >= 6 && years <= 10;
        case "11-15년":
          return years >= 11 && years <= 15;
        case "16-19년":
          return years >= 16 && years <= 19;
        case "20년 이상":
          return years >= 20;
        default:
          return true;
      }
    })();

    return careerPass && educationOk && companyTypeOk && searchOk;
  });

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 7000);
      return () => clearTimeout(timeout);
    }
  }, [filteredCandidates]);

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
  };

  return (
    <div className="full-view-main-wrapper">
      <MemberNavigation />
      <header>
        <div className="full-view-main-index-wrapper">
          <img src={FileLogo} alt="-" />
          <h2>전체 DB 열람</h2>
        </div>
        <p>
          하이어리즘에서 열람 가능한 후보자 전체 DB 입니다. 더 자세한 필터링을
          원하시면 '추천' 서비스를 이용해보세요!
        </p>
      </header>

      <div className="filter-search-section">
        <div className="filter-controls">
          <div className="filter-wrapper">
            <CareerFilterBar
              selectedCareer={selectedCareer}
              onChange={(e) => {
                setSelectedCareer(e.target.value);
                setIsLoading(true);
              }}
            />
            <EducationFilterBar
              selectedEducation={selectedEducation}
              onChange={(e) => {
                setSelectedEducation(e.target.value);
                setIsLoading(true);
              }}
            />
            <CompanyTypeFilterBar
              selectedCompanyType={selectedCompanyType}
              onChange={(e) => {
                setSelectedCompanyType(e.target.value);
                setIsLoading(true);
              }}
            />
          </div>
          <div className="search-bar">
            <img src={SearchIcon} alt="검색" className="search-icon" />
            <input
              type="text"
              placeholder="후보자명 or SKILLS 검색하기"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsLoading(true);
              }}
            />
          </div>
        </div>

        <div className="search-and-buttons-wrapper">
          <div className="sort-refresh-btns">
            <button
              className={`sort-filter-btn ${
                sortType === "latest" ? "selected" : ""
              }`}
              onClick={() => setSortType("latest")}
            >
              최신순
            </button>
            <button
              className={`sort-filter-btn ${
                sortType === "popular" ? "selected" : ""
              }`}
              onClick={() => setSortType("popular")}
            >
              인기순
            </button>
            <div
              className="refresh-btn-wrapper"
              onMouseEnter={() => setIsHoveringRefresh(true)}
              onMouseLeave={() => setIsHoveringRefresh(false)}
            >
              <button className="refresh-btns" onClick={getCandidateList}>
                <img src={RefreshIcon} alt="새로고침" />
              </button>
              {isHoveringRefresh && (
                <div className="refresh-hover-label">새로고침</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="db-list-wrapper">
        {isLoading ? (
          <div className="loading-wrapper">
            <div className="loading-spinner"></div>
            <span className="loading-text">
              후보자 정보를 불러오는 중입니다...
            </span>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="no-result-wrapper">
            <span className="no-result-text">
              조건에 맞는 후보자가 존재하지 않습니다.
            </span>
          </div>
        ) : (
          filteredCandidates.map((candidate, index) => (
            <DBItem
              key={index}
              candidate={candidate}
              onClick={handleCandidateClick}
              userEmail={userEmail}
              liked={wishlist.includes(candidate.resume_id)}
              onToggleWishlist={(resumeId: string, isLiked: boolean) => {
                setCandidateData((prev) =>
                  prev.map((c) =>
                    c.resume_id === resumeId
                      ? {
                          ...c,
                          wishlist: isLiked
                            ? [...(c.wishlist || []), userEmail]
                            : (c.wishlist || []).filter((e) => e !== userEmail),
                        }
                      : c
                  )
                );
              }}
            />
          ))
        )}
      </div>

      {isDetailModalOpen && selectedCandidate && (
        <ProfileDetail
          onClose={handleCloseDetailModal}
          name={selectedCandidate.name}
          keyword={selectedCandidate.keyword}
          age={selectedCandidate.age}
          userEmail={userEmail}
          resume_id={selectedCandidate.resume_id}
          onToggleWishlist={(id, state) => {
            setCandidateData((prev) =>
              prev.map((c) =>
                c.resume_id === id
                  ? {
                      ...c,
                      wishlist: state
                        ? [...(c.wishlist || []), userEmail]
                        : (c.wishlist || []).filter((e) => e !== userEmail),
                    }
                  : c
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default Browse;
