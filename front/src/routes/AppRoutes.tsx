import { Routes, Route } from "react-router-dom";

/* TODO: 직접 type 정의할것 */
interface AppRoutesProps {
  recommendResult: unknown;
  setRecommendResult: React.Dispatch<React.SetStateAction<unknown>>;
}

function AppRoutes({ recommendResult, setRecommendResult }: AppRoutesProps) {
  return (
    <Routes>
      {/* 메인페이지 */}
      <Route path="/user" element={<PersonalMain />} />
      <Route path="/" element={<CorporateMain />} />
      <Route path="/headhunter" element={<HeadhunterMain />} />

      {/* 로그인 & 회원가입 페이지 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/find_id" element={<FindIdPage />} />
      <Route path="/find_password" element={<FindPasswordPage />} />

      {/* 추천 페이지 */}
      <Route path="/recommend_company" element={<CorporateImage />} />
      <Route
        path="/recommend_strength"
        element={<StrengthRecommend setRecommendResult={setRecommendResult} />}
      />

      {/* 추천 결과 페이지 */}
      <Route
        path="/recommend_company/result"
        element={<CorporateImageResult />}
      />
      <Route
        path="/recommend_strength/result"
        element={<StrengthResult recommendResult={recommendResult} />}
      />

      {/* NonMember(구직자) 이력서 등록 페이지 */}
      <Route path="/user/resume" element={<ResumePage />} />

      {/* DB 전체 열람 페이지 */}
      <Route path="/full_view" element={<FullViewMainPage />} />

      {/* 마이페이지 */}
      <Route path="/MyPage" element={<MyPage />} />
    </Routes>
  );
}

export default AppRoutes;
