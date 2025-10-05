import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./main.css";
import NotMemberNavigation from "../../components/NotMemberNavigation";
import UpAnimation from "../../assets/icon/UpAnimation.svg";
import DownAnimation from "../../assets/icon/DownAnimation.svg";
import DownAnimation2 from "../../assets/icon/DownAnimation2.svg";
import BannerImage1 from "../../assets/image/005.jpg";
import BannerImage2 from "../../assets/image/006.gif";
import BannerImage5 from "../../assets/image/last.jpg";
import LoginIcon from "../../assets/icon/LoginIcon.svg";
import SignupIcon from "../../assets/icon/SignupIcon.svg";

// 배너 이미지 정의 배열
const bannerData = [
  { image: BannerImage1, downIcon: DownAnimation },
  { image: BannerImage2, downIcon: DownAnimation2 },
  { image: BannerImage5, downIcon: null },
];

function CorporateMain() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0); // 현재 보여지는 배너 페이지 인덱스 상태 (0부터 시작)
  const maxPage = bannerData.length - 1;
  const [isScrolling, setIsScrolling] = useState(false);

  // 배너 페이지 전환 함수
  const goNext = () => setPage((p) => Math.min(p + 1, maxPage));
  const goPrev = () => setPage((p) => Math.max(p - 1, 0));

  // 스크롤 이벤트에 따른 페이지 이동 처리 함수
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isScrolling) return;

      if (e.deltaY > 50 && page < maxPage) {
        setIsScrolling(true);
        setPage((p) => Math.min(p + 1, maxPage));
      } else if (e.deltaY < -50 && page > 0) {
        setIsScrolling(true);
        setPage((p) => Math.max(p - 1, 0));
      }
    },
    [page, maxPage, isScrolling]
  );

  // 스크롤 이벤트 등록 및 해제
  useEffect(() => {
    const handleWheelEvent = (e: Event) => {
      e.preventDefault();
      handleWheel(e as WheelEvent);
    };

    window.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheelEvent);
    };
  }, [handleWheel]);

  // 애니메이션 중 스크롤 방지 타이머 설정
  useEffect(() => {
    if (isScrolling) {
      const timeout = setTimeout(() => setIsScrolling(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [isScrolling]);

  return (
    <div className="personal-main_container">
      <NotMemberNavigation />
      {/* 슬라이드 애니메이션 적용 영역 */}
      <motion.div
        className="slides-wrapper"
        animate={{ y: `-${page * 100}vh` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* 각 배너 섹션을 렌더링 */}
        {bannerData.map((banner, index) => (
          <section
            key={index}
            className="banner"
            style={{
              backgroundColor: index === 0 ? "#f2fff7" : "#E6EFEB",
              backgroundImage: `url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              aspectRatio: "16 / 9",
            }}
          >
            {index !== 0 && (
              <div className="banner-top-button-wrapper">
                <button className="up-scroll-button" onClick={goPrev}>
                  <motion.img
                    src={UpAnimation}
                    alt="↑ 이전으로"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                </button>
              </div>
            )}

            <div className="banner-button-wrapper">
              {/* 마지막 배너일 때 CTA 버튼 렌더링 */}
              {index !== maxPage && banner.downIcon && (
                <button className="down-scroll-button" onClick={goNext}>
                  <motion.img
                    src={banner.downIcon}
                    alt="↓ 다음으로"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                </button>
              )}

              {/* CTA 버튼 클릭 시 라우팅 처리 */}
              {index === maxPage && (
                <div className="banner-final-cta-section">
                  <button onClick={() => navigate("/login")}>
                    <img src={LoginIcon} alt="📄" />
                    <p className="cta-p1">이미 하이어리즘의 회원이시라면?</p>
                    <p className="cta-p2">로그인 하러가기</p>
                  </button>
                  <button onClick={() => navigate("/signup")}>
                    <img src={SignupIcon} alt="📄" />
                    <p className="cta-p1">하이어리즘의 회원이 아니시라면?</p>
                    <p className="cta-p2">회원가입 하러가기</p>
                  </button>
                </div>
              )}
            </div>
          </section>
        ))}
      </motion.div>
    </div>
  );
}

export default CorporateMain;
