import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateTokens = (userId, email, role) => {
  const payload = { userId, email, role };

  return {
    accessToken: jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    }),
    refreshToken: jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    }),
  };
};

export const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken);
    const { accessToken, refreshToken: nextRefreshToken } = generateTokens(
      decoded.userId,
      decoded.email,
      decoded.role,
    );

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
