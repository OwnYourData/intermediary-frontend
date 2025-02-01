// Data Catalouge
export const SERVICES_URL = "https://admin.go-data.at/api/services";
export const CATALOGUE_HOST = process.env.DATA_CATALOG_HOST!!;
export const CATALOGUE_COLLECTION = process.env.DATA_CATALOG_ID!!;

// Service Catalogue
export const SERVICES_HOST = process.env.SERVICE_CATALOG_HOST!! || CATALOGUE_HOST;
export const SERVICES_COLLECTION = process.env.SERVICE_CATALOG_ID!! || CATALOGUE_COLLECTION;


