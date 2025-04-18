import { decodeJwt, JWK } from 'jose';
import { experimental_taintObjectReference, experimental_taintUniqueValue } from 'react';

experimental_taintObjectReference("No server process.env should be on the client", process.env);

// Admin
export const ADMIN_HOST   = process.env.ADMIN_HOST!! || "admin.go-data.at";
export const ADMIN_CLIENT = process.env.ADMIN_CLIENT!!;
export const ADMIN_SECRET = process.env.ADMIN_SECRET!!;
experimental_taintUniqueValue("No Admin Secret should be on the client", module, ADMIN_SECRET);

// QR Login
export const QR_LOGIN_URL = `https://${ADMIN_HOST}/api/qr-login`;
export const QR_CHECK_URL = `https://${ADMIN_HOST}/api/login-check`;

// Admin JWT Secret
export const JWT_PUBKEY = decodeJwt(process.env.ADMIN_JWT_PUBKEY!!) as JWK;
