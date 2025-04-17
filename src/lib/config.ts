import { JWK } from 'jose';

// Admin
export const ADMIN_HOST   = process.env.ADMIN_HOST!! || "admin.go-data.at";
export const ADMIN_CLIENT = process.env.ADMIN_CLIENT!!;
export const ADMIN_SECRET = process.env.ADMIN_SECRET!!;

// QR Login
export const QR_LOGIN_URL = `https://${ADMIN_HOST}/api/qr-login`;
export const QR_CHECK_URL = `https://${ADMIN_HOST}/api/login-check`;

// Admin JWT Secret
export const JWT_PUBKEY = {"crv":"P-256","kty":"EC","x":"FqyttsFyXclYxe3dGV8Alebanx2hM94NqMoyx-IaAmQ","y":"rii1QZjNCd1EVIxO182uc_i3VDpaN1eB3zQ4eZGTkBY"} as JWK;
