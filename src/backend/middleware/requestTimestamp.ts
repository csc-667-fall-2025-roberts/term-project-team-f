import { NextFunction, Request, Response } from "express";

const requestTimestampMiddleware = (
  _request: Request,
  _response: Response,
  next: NextFunction,
) => {
  console.log(`Request received at ${new Date().toLocaleString()}`);

  next();
};

export default requestTimestampMiddleware;
