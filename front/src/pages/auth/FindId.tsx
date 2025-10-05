import { useState } from "react";
import "./css/find-id.css";
import NotMemberNavigation from "../../components/NotMemberNavigation";
import axios from "axios";

function FindIdPage() {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  //const [phone, setPhone] = useState("");
  const [phone1, setPhone1] = useState<string>("");
  const [phone2, setPhone2] = useState<string>("");
  const [phone3, setPhone3] = useState<string>("");
  //const [code, setCode] = useState("");
  const [email, setEmail] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const BACK_URL = process.env.REACT_APP_BACKEND_ADDRESS;

  const handleNext = async (): Promise<void> => {
    const phone = `${phone1}-${phone2}-${phone3}`;

    try {
      const response = await axios.post(`${BACK_URL}/auth/find-id`, {
        name,
        phone,
      });
      const data = response.data;

      setEmail(data.email);
      setDate(data.created_at);
      setStep(2);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        alert("일치하는 사용자를 찾을 수 없습니다.");
      } else {
        alert("아이디 찾기에 실패했습니다. 다시 시도해주세요.");
        console.error("아이디 찾기 오류:", error);
      }
    }
  };

  return (
    <div className="find-id_container">
      {/* 네비게이션 */}
      <NotMemberNavigation />
      <div className="find-id_content">
        <div className="find-id_header-inline">
          <h2 className="find-id_title">가입된 메일 찾기</h2>
          <span className="find-id_desc-inline">
            회원정보에 등록된 개인전화번호로 본인인증을 해주세요!
          </span>
        </div>
        {step === 1 ? (
          <>
            <div className="find-id_find-id-box">
              <div className="find-id_header-row"></div>
              <div className="find-id_form-group">
                <label>
                  이름<span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="find-id_form-group">
                <label>
                  개인전화번호<span>*</span>
                </label>
                <div className="find-id_phone-input">
                  <input
                    type="text"
                    placeholder="000"
                    maxLength={3}
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="text"
                    placeholder="0000"
                    maxLength={4}
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="text"
                    placeholder="0000"
                    maxLength={4}
                    value={phone3}
                    onChange={(e) => setPhone3(e.target.value)}
                  />
                  {/* 
                  <button className="find-id_verify-btn">인증번호 전송</button>
                  */}
                </div>
              </div>
              {/* 
              <div className="find-id_form-group">
                <label>
                  인증번호<span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="인증번호를 입력하세요 (숫자6자리)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                /> 
              </div> */}
              <button className="find-id_next-btn" onClick={handleNext}>
                다음
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="find-id_result">
              <span className="find-id_email">{email}</span>
              <span className="find-id_date">
                가입 날짜 : {date.slice(0, 10)}
              </span>
            </div>
            <div className="find-id_btn-group">
              <button className="find-id_login-action">로그인하기</button>
              <button className="find-id_find-pw">비밀번호 찾기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FindIdPage;
