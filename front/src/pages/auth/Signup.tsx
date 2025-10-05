import React, { useState } from "react";
import "./css/signup.css";
import NotMemberNavigation from "../../components/NotMemberNavigation";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FileLogo from "../../assets/icon/FileLogo.svg";

interface Term {
  required: boolean;
  title: string;
  content: string;
}

const terms: Term[] = [
  {
    required: true,
    title: "서비스 이용약관 동의",
    content: `
      본 이용약관은 회사(이하 ‘당사’)가 제공하는 모든 서비스의 이용과 관련하여 
      당사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정합니다.
      이용자는 본 약관에 동의함으로써 당사의 서비스 이용 조건을 이해하고 이에 동의한 것으로 간주됩니다.
    `.trim(),
  },
  {
    required: true,
    title: "개인정보 수집 및 이용 동의",
    content: `
      당사는 회원가입, 본인 확인, 서비스 제공 및 상담 등을 위해 아래와 같은 개인정보를 수집합니다.
      [수집 항목] 이름, 이메일, 비밀번호, 휴대전화번호 등
      수집된 개인정보는 목적 달성 후 지체 없이 파기되며, 동의 거부 시 서비스 이용에 제한이 있을 수 있습니다.
    `.trim(),
  },
  {
    required: true,
    title: "문자서비스 이용약관 동의",
    content: `
      당사는 서비스 운영에 필요한 안내, 본인 인증 및 마케팅 정보를 전송하기 위해
      회원의 휴대전화번호로 문자(SMS, LMS)를 발송할 수 있습니다.
      본 약관에 동의함으로써 회원은 해당 문자 수신에 동의한 것으로 간주됩니다.
    `.trim(),
  },
  {
    required: false,
    title: "개인정보 제3자 제공 동의",
    content: `
      당사는 서비스 제공을 위해 최소한의 개인정보를 제휴사에 제공할 수 있으며, 제공 시 사전에 별도의 동의를 받습니다.
      [제공 항목] 이름, 이메일, 휴대전화번호 등
      제3자 제공에 동의하지 않더라도 서비스 이용에는 제한이 없습니다.
    `.trim(),
  },
  {
    required: false,
    title: "광고성 정보 수신 동의",
    content: `
      당사는 이벤트, 혜택, 신규 서비스 안내 등 광고성 정보를 이메일, 문자메시지 등을 통해 발송할 수 있습니다.
      수신 동의는 선택 사항이며, 마케팅 정보 수신을 원하지 않을 경우 언제든지 철회하실 수 있습니다.
    `.trim(),
  },
];

interface FormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone1: string;
  phone2: string;
  phone3: string;
  verify_code: string;
  role: string;
  company_name: string;
}

interface ErrorState {
  email: string;
  general: string;
}

function SignUp() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [checkedTerms, setCheckedTerms] = useState<boolean[]>(
    new Array(terms.length).fill(false)
  );

  const [errors, setErrors] = useState<ErrorState>({
    email: "",
    general: "",
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone1: "",
    phone2: "",
    phone3: "",
    verify_code: "",
    role: "",
    company_name: "",
  });

  const BACK_URL = process.env.REACT_APP_BACKEND_ADDRESS;

  const toggleTerm = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "", general: "" }));
  };

  const handleSendVerificationCode = async (): Promise<void> => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "이메일을 입력해주세요." }));
      return;
    }

    try {
      await axios.get(`${BACK_URL}/auth/send-email-verification`, {
        params: { email: formData.email },
      });
      alert("인증번호가 이메일로 전송되었습니다.");
    } catch (error: unknown) {
      console.error("인증번호 전송 오류:", error);
      setErrors((prev) => ({
        ...prev,
        email: "인증번호 전송에 실패했습니다.",
      }));
    }
  };

  const handleAllAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setCheckedTerms(new Array(terms.length).fill(isChecked));
  };

  const handleTermChange = (index: number) => {
    const updated = [...checkedTerms];
    updated[index] = !updated[index];
    setCheckedTerms(updated);
  };

  const handleCheckEmail = async (): Promise<void> => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "이메일을 입력해주세요." }));
      return;
    }

    try {
      const res = await axios.post(`${BACK_URL}/auth/check-id`, {
        email: formData.email,
      });

      if (res.data.available) {
        //alert("사용 가능한 이메일입니다.");
        setErrors((prev) => ({ ...prev, email: "" }));
        await handleSendVerificationCode(); // ✅ 중복 확인 후 인증번호 전송
      } else {
        setErrors((prev) => ({ ...prev, email: "이미 가입된 이메일입니다." }));
      }
    } catch (error: unknown) {
      console.error("이메일 중복 확인 오류:", error);
      setErrors((prev) => ({
        ...prev,
        email: "이메일 확인 중 오류가 발생했습니다.",
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const {
      name,
      email,
      password,
      passwordConfirm,
      phone1,
      phone2,
      phone3,
      role,
      company_name,
      verify_code,
    } = formData;

    if (
      !name ||
      !email ||
      !password ||
      !passwordConfirm ||
      !phone1 ||
      !phone2 ||
      !phone3 ||
      !role ||
      !company_name ||
      !verify_code
    ) {
      setErrors((prev) => ({ ...prev, general: "모든 필드를 입력해주세요." }));
      return;
    }

    if (password !== passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        general: "비밀번호가 일치하지 않습니다.",
      }));
      return;
    }

    const phone = `${phone1}-${phone2}-${phone3}`;

    try {
      await axios.post(`${BACK_URL}/auth/signup`, {
        name,
        email,
        password,
        phone,
        role,
        company_name,
        verify_code,
      });

      alert("회원가입 성공!");
      navigate("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrors((prev) => ({
          ...prev,
          general:
            "회원가입 실패: " + (err.response?.data?.message || "서버 오류"),
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "회원가입 실패: 알 수 없는 오류",
        }));
      }
    }
  };

  return (
    <div className="signup_wrapper">
      <NotMemberNavigation />
      <header>
        {/* 페이지 인덱스 */}
        <div className="full-view-main-index-wrapper">
          <img src={FileLogo} alt="-" />
          <h2>회원가입</h2>
        </div>
      </header>

      <form className="signup_form" onSubmit={handleSignup}>
        <h2 className="signup_section-title">
          약관동의<span className="required">*</span>
        </h2>
        <div className="signup_terms-box">
          <div className="signup_term-all">
            <input
              type="checkbox"
              id="all-agree"
              className="signup_checkbox"
              checked={checkedTerms.every(Boolean)}
              onChange={handleAllAgreeChange}
            />
            <label htmlFor="all-agree">전체동의</label>
          </div>
          <p className="signup_term-all-sub">
            선택항목 포함 모든 약관에 동의합니다.
          </p>
          <hr className="signup_divider" />
          {terms.map((term, idx) => (
            <div key={idx} className="signup_term-section">
              <div className="signup_term-title">
                <input
                  type="checkbox"
                  id={`term-${idx}`}
                  className="signup_checkbox"
                  checked={checkedTerms[idx]}
                  onChange={() => handleTermChange(idx)}
                />
                <label htmlFor={`term-${idx}`} className="term-title-text">
                  <span className={term.required ? "green-star" : ""}>
                    {term.required ? "＊" : ""}
                  </span>
                  {term.title}
                </label>
                <span className="signup_arrow" onClick={() => toggleTerm(idx)}>
                  {openIndex === idx ? "▲" : "▼"}
                </span>
              </div>
              {openIndex === idx && (
                <div className="signup_term-content">{term.content}</div>
              )}
              {term.title === "문자서비스 이용약관 동의" && (
                <hr className="signup_divider" />
              )}
            </div>
          ))}
        </div>

        <div className="signup_form-group">
          <label>
            이름<span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="이름을 입력하세요."
            onChange={handleChange}
          />
        </div>

        <div className="signup_form-group horizontal">
          <label>
            이메일<span className="required">*</span>
          </label>
          <div
            className="signup_input-with-btn"
            style={{ flexDirection: "column", alignItems: "flex-start" }}
          >
            <div style={{ display: "flex", width: "100%", gap: "0.5rem" }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="예: example@gmail.com"
                onChange={handleChange}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="signup_btn-secondary"
                onClick={handleCheckEmail}
              >
                인증 번호 받기
              </button>
            </div>
            {errors.email && <p className="email-error">{errors.email}</p>}
          </div>
        </div>

        <div className="signup_form-group">
          <label>
            인증번호<span className="required">*</span>
          </label>
          <input
            type="text"
            name="verify_code"
            value={formData.verify_code}
            onChange={handleChange}
          />
        </div>

        <div className="signup_form-group">
          <label>
            비밀번호<span className="required">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="비밀번호 입력"
            onChange={handleChange}
          />
        </div>

        <div className="signup_form-group">
          <label>
            비밀번호 확인<span className="required">*</span>
          </label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            placeholder="비밀번호 재입력"
            onChange={handleChange}
            onBlur={() => setPasswordTouched(true)}
          />
        </div>

        {passwordTouched &&
          formData.passwordConfirm &&
          formData.password !== formData.passwordConfirm && (
            <p className="error-message">비밀번호가 일치하지 않습니다.</p>
          )}

        <div className="signup_form-group horizontal">
          <label>
            개인전화번호<span className="required">*</span>
          </label>
          <div className="signup_phone-wrapper">
            <input
              type="text"
              name="phone1"
              maxLength={3}
              value={formData.phone1}
              onChange={handleChange}
            />
            <span>-</span>
            <input
              type="text"
              name="phone2"
              maxLength={4}
              value={formData.phone2}
              onChange={handleChange}
            />
            <span>-</span>
            <input
              type="text"
              name="phone3"
              maxLength={4}
              value={formData.phone3}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="signup_form-group">
          <label>
            회원 형식<span className="required">*</span>
          </label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="">회원 형식을 선택하세요</option>
            <option value="company">기업회원</option>
            <option value="headhunter">헤드헌터</option>
          </select>
        </div>

        <div className="signup_form-group">
          <label>
            회사/점포명<span className="required">*</span>
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            placeholder="회사/점포명을 입력해주세요."
            onChange={handleChange}
          />
        </div>

        {errors.general && <p className="error-message">{errors.general}</p>}

        <button type="submit" className="signup_submit-btn">
          가입하기
        </button>
      </form>
    </div>
  );
}

export default SignUp;
