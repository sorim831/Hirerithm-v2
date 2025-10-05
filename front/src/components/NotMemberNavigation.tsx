import { useState } from "react";
import HirerithmLogo from "../../Image/logo/NavigationLogo.png";
import "./navigation.css";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);

  // 하위 경로까지 포함하도록 수정
  const isActive = (path: string): boolean => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navigation-wrapper">
      {/* 하이어리즘 로고 */}
      <div className="navigation-logo" onClick={() => navigate("/")}>
        <img src={HirerithmLogo} alt="하이어리즘 (Hire + Algorithm)" />
      </div>

      {/* 페이지 이동 버튼들 */}
      <div className="navigation-buttons">
        {/* 기업회원 */}
        <div
          className="nav-item"
          onMouseEnter={() => setHoverMenu("company")}
          onMouseLeave={() => setHoverMenu(null)}
        >
          <button
            className={isActive("/") ? "active" : ""}
            onClick={() => navigate("/")}
          >
            기업회원
          </button>
          {hoverMenu === "company" && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate("/")}>
                메인
              </div>
            </div>
          )}
        </div>

        {/* 헤드헌터 */}
        <div
          className="nav-item"
          onMouseEnter={() => setHoverMenu("headhunter")}
          onMouseLeave={() => setHoverMenu(null)}
        >
          <button
            className={isActive("/headhunter") ? "active" : ""}
            onClick={() => navigate("/headhunter")}
          >
            헤드헌터
          </button>
          {hoverMenu === "headhunter" && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => navigate("/headhunter")}
              >
                메인
              </div>
            </div>
          )}
        </div>

        {/* 개인 */}
        <div
          className="nav-item"
          onMouseEnter={() => setHoverMenu("user")}
          onMouseLeave={() => setHoverMenu(null)}
        >
          <button
            className={isActive("/user") ? "active" : ""}
            onClick={() => navigate("/user")}
          >
            개인
          </button>
          {hoverMenu === "user" && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate("/user")}>
                메인
              </div>
              <div
                className="dropdown-item"
                onClick={() => navigate("/user/resume")}
              >
                이력서 등록
              </div>
            </div>
          )}
        </div>

        {/* 로그인 */}
        <div
          className="nav-item"
          onMouseEnter={() => setHoverMenu("login")}
          onMouseLeave={() => setHoverMenu(null)}
        >
          <button
            className={
              isActive("/login") || isActive("/signup") || isActive("/find_")
                ? "active"
                : ""
            }
            onClick={() => navigate("/login")}
          >
            로그인
          </button>
          {hoverMenu === "login" && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate("/login")}>
                로그인
              </div>
              <div
                className="dropdown-item"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
