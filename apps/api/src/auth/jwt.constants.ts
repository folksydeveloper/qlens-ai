function requireSecret(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || fallback;
}

export const JWT_SECRET = requireSecret('JWT_SECRET', 'dev-jwt-secret-change-me');
export const JWT_REFRESH_SECRET = requireSecret('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me');
