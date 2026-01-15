"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const config_1 = require("./config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({
            message: "Authorization header missing",
        });
    }
    // Expect: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({
            message: "Token missing",
        });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.JWT_PASSWORD);
        // @ts-ignore
        req.id = payload.id;
        next();
    }
    catch (e) {
        return res.status(403).json({
            message: "You are not logged in",
        });
    }
}
