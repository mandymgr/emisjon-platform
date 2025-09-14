import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle specific error codes
  const errorCode = (err as any).code;
  let statusCode = (err as any).statusCode || 500;
  let message = err.message || 'Internal server error';

  // Set appropriate status codes based on error type
  if (errorCode === 'USER_NOT_FOUND') {
    statusCode = 404;
  } else if (errorCode === 'INVALID_PASSWORD') {
    statusCode = 401;
  } else if (message.includes('User already exists')) {
    statusCode = 409;
  } else if (message.includes('Invalid credentials')) {
    statusCode = 401;
  }

  res.status(statusCode).json({
    error: message,
    code: errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};