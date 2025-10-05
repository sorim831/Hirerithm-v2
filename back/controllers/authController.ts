import { Request, Response } from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/Recruiter";
import VerificationCode from "../models/verificationCode";
import EmailVerificationCode from "../models/emailVerificationCode";

import { RecruiterDocument } from "../models/Recruiter";

import { AuthenticatedRequest } from "../middlewares/authMiddleware";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 사용자 정의 Request 타입
interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    verify_code: string;
    password: string;
    phone: string;
    role: "headhunter" | "company";
    company_name: string;
  };
}

interface PhoneRequest extends Request {
  body: {
    phone?: string;
  };
}

interface EmailRequest extends Request {
  query: {
    email?: string;
  };
}

interface VerifyCodeRequest extends Request {
  body: {
    email?: string;
    verify_code?: string;
  };
}

interface FindIdRequest extends Request {
  body: {
    name: string;
    phone: string;
  };
}

interface FindPasswordRequest extends Request {
  body: {
    email: string;
    verify_code: string;
  };
}

interface ResetPasswordRequest extends Request {
  body: {
    email: string;
    new_password: string;
  };
}

// 회원가입
export const register = async (
  req: RegisterRequest,
  res: Response
): Promise<void> => {
  try {
    // 인증번호 없이 받도록 수정
    //const { name, email, password, phone, role, company_name } =
    ////req.body;

    const { name, email, verify_code, password, phone, role, company_name } =
      req.body;
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !role ||
      !company_name ||
      !verify_code
    ) {
      res
        .status(400)
        .json({ success: false, message: "모든 필드를 입력해주세요." });
      return;
    }

    // 인증번호 검증 제거
    /*
    const validCode = await VerificationCode.findOne({ phone, verify_code });
    if (!validCode) {
      return res
        .status(400)
        .json({ success: false, message: "인증번호가 올바르지 않습니다." });
    }
        */

    const codeRecord = await EmailVerificationCode.findOne({
      email,
      verify_code,
    });

    if (!codeRecord) {
      res
        .status(400)
        .json({ success: false, message: "인증번호가 틀렸습니다." });
      return;
    }

    if (codeRecord.expires_at < new Date()) {
      res
        .status(400)
        .json({ success: false, message: "인증번호가 만료되었습니다." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password_hash: hashedPassword,
      phone,
      role,
      company_name,
    });

    await newUser.save();

    // 인증번호 삭제 제거
    //await VerificationCode.deleteOne({ phone });
    await EmailVerificationCode.deleteOne({ email });

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
    });
    return;
  } catch (error: unknown) {
    console.error("회원가입 오류:", error);

    // Mongoose validation 에러 처리
    if (error instanceof Error && error.name === "ValidationError") {
      const messages = Object.values((error as any).errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        message: messages[0], // 여러 개일 경우 첫 번째만 보여줌
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 로그인
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  console.log("로그인 요청 도착:", req.body);
  try {
    const user = (await User.findOne({ email })) as RecruiterDocument | null;
    console.log(user);
    if (!user) {
      res.status(400).json({ error: "등록되지 않은 사용자입니다." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ error: "비밀번호가 잘못되었습니다." });
      return;
    }

    const token = jwt.sign(
      { userEmail: user.email, userRole: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    console.log(token);
    res.status(200).json({ token, userEmail: user.email });
  } catch (error) {
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 이메일 중복 체크
export const checkIdAvailability = async (
  req: RegisterRequest,
  res: Response
): Promise<void> => {
  console.log("중복 확인 요청:", req.body); // 로그 확인용
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "이메일을 입력해주세요." });
    return;
  }

  const existingUser: RecruiterDocument | null = await User.findOne({ email });
  if (!existingUser) {
    res.status(200).json({ available: true });
    return;
  }

  res.status(200).json({ available: false });
  return;
};

// 인증번호 전송
export const sendVerifynumber = async (
  req: PhoneRequest,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ message: "전화번호를 입력해주세요." });
      return;
    }

    const verifyCode = "123456"; // 임시 인증번호

    await VerificationCode.deleteOne({ phone });

    const newCode = new VerificationCode({
      phone,
      code: verifyCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await newCode.save();

    res.status(200).json({ message: "인증번호가 전송되었습니다." });
  } catch (error) {
    console.error("인증번호 전송 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 이메일 인증번호 전송
export const sendEmailVerifynumber = async (
  req: EmailRequest,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ message: "이메일을 입력해주세요." });
      return;
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤

    await EmailVerificationCode.deleteOne({ email });

    const newCode = new EmailVerificationCode({
      email,
      verify_code: verifyCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10분 유효
    });
    await newCode.save();

    const mailOptions = {
      from: `"HireRithm 인증센터" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "[HireRithm] 이메일 인증번호",
      html: `<h2>인증번호: ${verifyCode}</h2><p>10분 안에 입력해주세요!</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`이메일 ${email}로 인증번호 ${verifyCode} 전송`);

    res.status(200).json({ message: "인증번호가 전송되었습니다." });
  } catch (error) {
    console.error("이메일 인증번호 전송 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 이메일 인증번호 확인
export const checkVerifyCode = async (
  req: VerifyCodeRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, verify_code } = req.body;

    if (!email || !verify_code) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력해주세요.",
      });
      return;
    }

    const codeRecord = await EmailVerificationCode.findOne({
      email,
      verify_code,
    });

    if (!codeRecord) {
      res.status(400).json({
        success: false,
        message: "인증번호가 틀렸습니다.",
      });
      return;
    }

    if (codeRecord.expires_at < new Date()) {
      res.status(400).json({
        success: false,
        message: "인증번호가 만료되었습니다.",
      });
      return;
    }

    await EmailVerificationCode.deleteOne({ email });

    res.status(201).json({
      success: true,
      message: "인증이 완료되었습니다.",
    });
  } catch (error) {
    console.error("인증 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 아이디 찾기
export const findId = async (
  req: FindIdRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, phone } = req.body;
    //console.log(name, phone);

    /*
    const validCode = await VerificationCode.findOne({ phone, verify_code });
    if (!validCode) {
      return res
        .status(400)
        .json({ success: false, message: "인증번호가 올바르지 않습니다." });
    }
        */

    const user = await User.findOne({ name, phone });
    if (!user) {
      res.status(404).json({ message: "일치하는 사용자를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({ email: user.email, created_at: user.created_at });
  } catch (error) {
    console.error("아이디 찾기 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
// 비밀번호 찾기
export const findPassword = async (
  req: FindPasswordRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, verify_code } = req.body;

    // 이메일 인증 코드 검증
    const validCode = await EmailVerificationCode.findOne({
      email,
      verify_code,
    });
    if (!validCode) {
      res
        .status(400)
        .json({ success: false, message: "인증번호가 올바르지 않습니다." });
      return;
    }

    if (validCode.expires_at < new Date()) {
      res
        .status(400)
        .json({ success: false, message: "인증번호가 만료되었습니다." });
      return;
    }

    await EmailVerificationCode.deleteOne({ email });

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "일치하는 사용자를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({ message: "비밀번호 재설정 페이지로 이동.", email });
  } catch (error) {
    console.error("비밀번호 찾기 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 비밀번호 재설정
export const resetPassword = async (
  req: ResetPasswordRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, new_password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(404)
        .json({ message: "해당 이메일의 사용자를 찾을 수 없습니다." });
      return;
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password_hash = hashedPassword;
    await user.save();

    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 토큰 검증
export const verifyToken = (req: AuthenticatedRequest, res: Response): void => {
  console.log("verifyToken 실행됨, req.decoded:", req.decoded);
  res.status(200).json({ success: true, user: req.decoded });
};

// 사용자 정보 조회
export const getUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "토큰이 없습니다." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userEmail: string;
    };
    const user = await User.findOne({ email: decoded.userEmail }).select(
      "-password_hash"
    );

    if (!user) {
      res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("getUser 오류:", err);
    res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 사용자 정보 수정
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.decoded) {
      res.status(401).json({ message: "토큰이 없습니다." });
      return;
    }
    const userEmail = req.decoded.userEmail;
    const { name, phone, company_name } = req.body;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }
    /*
    || : 좌항이 falsy한 값이면 우항을 반환 (falsy: false, 0, "" (빈 문자열), null, undefined, NaN)
    ?? : 좌항이 null 또는 undefined일 때만 우항을 반환
    */
    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.company_name = company_name ?? user.company_name;

    await user.save();

    res.status(200).json({
      success: true,
      message: "회원 정보가 수정되었습니다.",
      user,
    });
  } catch (error) {
    console.error("회원 정보 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};
