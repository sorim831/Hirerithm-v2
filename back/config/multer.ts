import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const uploadDir = path.join(__dirname, "../pdf");

// 파일 저장 위치 및 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9가-힣_]/g, "");
    const fileName = `${Date.now()}-${baseName}${ext}`;
    cb(null, fileName);
  },
});

// 파일 필터링 (PDF만 허용)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("PDF 파일만 업로드할 수 있습니다."));
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한(임시)
});

export default upload;
