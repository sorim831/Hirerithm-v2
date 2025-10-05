import { useState } from "react";
import "./css/reset-password.css";
import NotMemberNavigation from "../../components/NotMemberNavigation";
import axios from "axios";

function ResetPassword() {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  // const [serverCode, setServerCode] = useState<string>(""); // 인증번호 저장 (실제 배포 시 백엔드에서 검증해야 함)
  const BACK_URL = process.env.REACT_APP_BACKEND_ADDRESS;

  // 1단계: 인증번호 전송
  const handleSendCode = async (): Promise<void> => {
    if (!email) {
      alert("이메일을 입력하세요.");
      return;
    }
    try {
      const res = await axios.get(`${BACK_URL}/auth/send-email-verification`, {
        params: { email },
      });

      // 임시로 res 변수 사용
      if (res.status === 200) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
      }

      // setServerCode(res.data.code); // 인증번호 저장 (실제 배포 시 백엔드에서 검증해야 함)
      alert("인증번호가 이메일로 전송되었습니다.");
    } catch (err: unknown) {
      console.error("인증번호 전송 실패:", err);
      alert("인증번호 전송에 실패했습니다.");
    }
  };

  // 2단계: 인증번호 확인
  const handleNext = async (): Promise<void> => {
    /*
    if (!email || !code) {
      alert("이메일과 인증번호를 모두 입력하세요.");
      return;
    }
    */

    /*
    if (code !== serverCode) {
      alert("인증번호가 올바르지 않습니다.");
      return;
    }
    */
    try {
      const res = await axios.post(`${BACK_URL}/auth/check-verify-code`, {
        email,
        verify_code: code,
      });

      if (res.data.success) {
        alert("인증이 완료되었습니다.");
        setStep(2);
      } else {
        alert("인증에 실패했습니다.");
      }
    } catch (err: unknown) {
      console.error("인증 확인 실패:", err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("인증 확인 중 오류가 발생했습니다.");
      }
    }
  };

  // 3단계: 비밀번호 재설정
  const handleResetPassword = async (): Promise<void> => {
    if (!newPassword || !confirmPassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      await axios.post(`${BACK_URL}/auth/reset-password`, {
        email,
        new_password: newPassword,
      });
      alert("비밀번호가 성공적으로 변경되었습니다.");
    } catch (err: unknown) {
      console.error("비밀번호 재설정 실패:", err);
      alert("비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <>
      <NotMemberNavigation />
      <div className="find-password_container">
        <div className="find-password_content">
          {step === 1 ? (
            <>
              <div className="find-password_header">
                <h2 className="find-password_title">
                  비밀번호 찾기&nbsp;
                  <span className="find-password_desc">
                    등록된 이메일로 인증해주세요.
                  </span>
                </h2>
              </div>

              <div className="find-password_box">
                <div className="find-password_inline-field">
                  <label className="find-password_label">
                    이메일<span className="required">*</span>
                  </label>
                  <div className="find-password_phone-row">
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="verify-btn" onClick={handleSendCode}>
                      인증번호 전송
                    </button>
                  </div>
                </div>

                <div className="find-password_inline-field">
                  <label className="find-password_label">
                    인증번호<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="숫자 6자리"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <button className="next-btn" onClick={handleNext}>
                  다음
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="find-password_title">비밀번호 재설정</h2>
              <p className="find-password_desc">
                인증이 완료되었습니다. 새 비밀번호를 입력해주세요.
              </p>

              <div className="find-password_box">
                <div className="find-password_inline-field">
                  <label className="find-password_label">이메일</label>
                  <input type="email" value={email} disabled />
                </div>

                <div className="find-password_inline-field">
                  <label className="find-password_label">
                    새 비밀번호<span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 입력"
                  />
                </div>

                <div className="find-password_inline-field">
                  <label className="find-password_label">
                    비밀번호 확인<span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 다시 입력"
                  />
                </div>

                <button className="next-btn" onClick={handleResetPassword}>
                  비밀번호 변경
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
