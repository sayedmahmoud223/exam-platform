import multer from "multer";
import { ResError } from "./ErrorHandling.js";

export const fileType = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/jfif"],
  pdf: ["application/pdf", "application/octet-stream"]
};

export const fileUpload = (allowedTypes = []) => {
  const storage = multer.diskStorage({}); // You're not storing files locally, just passing them to cloudinary

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
