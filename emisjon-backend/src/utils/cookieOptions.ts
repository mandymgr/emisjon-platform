import { CookieOptions } from 'express';

export function getCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // First-party cookie configuration
  const options: CookieOptions = {
    httpOnly: true, // Security: prevents JavaScript access
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax' as const, // First-party cookies can use Lax
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // Available on all paths
  };
  
  return options;
}

export function getClearCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction, // Must match getCookieOptions
    sameSite: 'lax' as const, // Must match getCookieOptions
    path: '/', // Must match getCookieOptions
  };

  return options;
}