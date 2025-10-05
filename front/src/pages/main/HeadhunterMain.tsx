import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./main.css";
import NotMemberNavigation from "../../components/NotMemberNavigation";
import UpAnimation from "../../assets/icon/UpAnimation.svg";
import DownAnimation from "../../assets/icon/DownAnimation.svg";
import DownAnimation2 from "../../assets/icon/DownAnimation2.svg";
import BannerImage1 from "../../assets/Image/001.jpg";
import BannerImage2 from "../../assets/Image/002.gif";
import BannerImage5 from "../../assets/Image/last.jpg";
import LoginIcon from "../../assets/icon/LoginIcon.svg";
import SignupIcon from "../../assets/icon/SignupIcon.svg";

// 배너 이미지와 아이콘 데이터
const bannerData: { image: string; downIcon: string | null }[] = [
  { image: BannerImage1, downIcon: DownAnimation },
  { image: BannerImage2, downIcon: DownAnimation2 },
  { image: BannerImage5, downIcon: null },
];

function HeadhunterMain() {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0); // 현재 페이지 인덱스
  const maxPage = bannerData.length - 1;
  const [isScrolling, setIsScrolling] = useState<boolean>(false); // 스크롤 중 여부

  const goNext = () => setPage((p) => Math.min(p + 1, maxPage));
  const goPrev = () => setPage((p) => Math.max(p - 1, 0));

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isScrolling) return;

      if (e.deltaY > 50) {
        if (page < maxPage) {
          setIsScrolling(true);
          setPage((p) => Math.min(p + 1, maxPage));
        }
      } else if (e.deltaY < -50) {
        if (page > 0) {
          setIsScrolling(true);
          setPage((p) => Math.max(p - 1, 0));
        }
      }
    },
    [page, maxPage, isScrolling]
  );

  useEffect(() => {
    const handleWheelEvent = (e: Event) => {
      e.preventDefault();
      handleWheel(e as unknown as WheelEvent);
    };

    window.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheelEvent);
    };
  }, [handleWheel]);

  useEffect(() => {
    if (isScrolling) {
      const timeout = setTimeout(() => setIsScrolling(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [isScrolling]);

  return (
    <div className="personal-main_container">
      <NotMemberNavigation />
      <motion.div
        className="slides-wrapper"
        animate={{ y: `-${page * 100}vh` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
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
              {index !== maxPage && (
                <button className="down-scroll-button" onClick={goNext}>
                  <motion.img
                    src={banner.downIcon ?? ""}
                    alt="↓ 다음으로"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                </button>
              )}

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

export default HeadhunterMain;
