import { JWK } from 'jose';

// QR Login
export const QR_LOGIN_URL = "https://admin.go-data.at/api/qr-login";
export const QR_CHECK_URL = "https://admin.go-data.at/api/login-check";

// Data Catalouge
export const SERVICES_URL = "https://admin.go-data.at/api/services";
export const CATALOGUE_HOST = process.env.DATA_CATALOG_HOST!!;
export const CATALOGUE_COLLECTION = process.env.DATA_CATALOG_ID!!;

// Service Catalogue
export const SERVICES_HOST = process.env.SERVICE_CATALOG_HOST!! || CATALOGUE_HOST;
export const SERVICES_COLLECTION = process.env.SERVICE_CATALOG_ID!! || CATALOGUE_COLLECTION;

// Admin JWT Secret
export const JWT_PUBKEY = {"crv":"P-256","kty":"EC","x":"FqyttsFyXclYxe3dGV8Alebanx2hM94NqMoyx-IaAmQ","y":"rii1QZjNCd1EVIxO182uc_i3VDpaN1eB3zQ4eZGTkBY"} as JWK;
