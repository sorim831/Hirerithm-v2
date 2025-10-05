import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./css/login.css";
import { FaUser, FaKey } from "react-icons/fa";
import { Link } from "react-router-dom";
import NotMemeberNavigation from "../../components/NotMemberNavigation";
import axios from "axios";
import FileLogo from "../../assets/icon/FileLogo.svg";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const BACK_URL = process.env.REACT_APP_BACKEND_ADDRESS;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BACK_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", response.data.userEmail);

      navigate("/recommend_strength");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.error ||
            "로그인 실패: 서버와의 통신에 문제가 있습니다."
        );
      } else {
        alert("예상치 못한 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="login_wrapper">
      <NotMemeberNavigation />

      <header>
        {/* 페이지 인덱스 */}
        <div className="login_index-wrapper">
          <img src={FileLogo} alt="-" />
          <h2>로그인</h2>
        </div>
      </header>

      <div className="login_box">
        <form onSubmit={handleLogin} className="login_flex">
          <div className="login_input-group">
            <div className="login_input-icon">
              <FaUser />
              <input
                type="email"
                placeholder="메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                required
              />
            </div>
            <div className="login_input-icon">
              <FaKey />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                required
              />
            </div>
          </div>

          <div className="login_btn-wrapper">
            <button type="submit" className="login_submit-right">
              로그인
            </button>
          </div>
        </form>

        <div className="login_links">
          <Link to="/find_id">아이디 찾기</Link>
          <Link to="/find_password">비밀번호 찾기</Link>
          <Link to="/signup" className="join-link">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
