import multer from "multer";
import { ResError } from "./ErrorHandling.js";

export const fileType = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/jfif"],
  pdf: ["application/pdf", "application/octet-stream"],
  excel: [
    "application/vnd.ms-excel", 
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
  ]
};

export const fileUpload = (allowedTypes = []) => {
  const storage = multer.memoryStorage({}); // You're not storing files locally, just passing them to cloudinary

  const fileFilter = (req, file, cb) => {
    console.log(file.mimetype);
    console.log(allowedTypes);
    console.log(file.mimetype);
    console.log(allowedTypes.includes(file.mimetype));

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new ResError("Invalid file format", 400), false); // Reject the file
    }
  };

  const upload = multer({ storage, fileFilter });
  return upload;
};
