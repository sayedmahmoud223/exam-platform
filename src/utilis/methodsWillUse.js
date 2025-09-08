import bcrypt from "bcryptjs"; // أو bcrypt حسب اللي بتستخدمه فعليًا
import jwt from "jsonwebtoken";
import { ResError } from "./ErrorHandling.js"; // تأكد من اسم الملف

class MethodsWillUsed {
    // Method to hash a plaintext value
    hash({ plaintext, salt = process.env.SALT_ROUND }) {
        const hashResult = bcrypt.hashSync(plaintext, parseInt(salt || '10')); // default to 10 if undefined
        return hashResult;
    }

    // Method to compare a plaintext value with a hash
    compare({ plaintext, hashValue }) {
        console.log({ hashValue });

        if (!hashValue) {
            throw new ResError("hashValue is required", 400);
        }

        console.log(process.env.SALT_ROUND);
        const match = bcrypt.compareSync(plaintext, hashValue);
        return match;
    }

    // Method to generate a JWT token
    generateToken({ payload = {}, signature = process.env.TOKEN_SIGNATURE, expiresIn = '7d' }) {
        console.log(process.env.TOKEN_SIGNATURE);

        if (!signature) {
            throw new Error("Signature (TOKEN_SIGNATURE) is missing.");
        }

        const token = jwt.sign(payload, signature, { expiresIn });
        return token;
    }

    // Method to verify a JWT token
    verifyToken({ token, signature = process.env.TOKEN_SIGNATURE }) {
        console.log({ signature });

        if (!signature) {
            throw new Error("Signature (TOKEN_SIGNATURE) is missing.");
        }

        const decoded = jwt.verify(token, signature);
        if (!decoded) {
            throw new ResError("token is invalid", 400)
        }

        return decoded;
    }
}

export const methodsWillUsed = new MethodsWillUsed();
