import { RequestHandler } from "express";

export const requestIntercepter: RequestHandler = (req, res, next) => {
  console.log(`→ ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
  next();
}