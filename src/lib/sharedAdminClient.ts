import AdminAPIClient from "./AdminAPIClient";

const globalForClient = globalThis as unknown as { admin_client: AdminAPIClient };

export const client = 
    globalForClient.admin_client || AdminAPIClient.get_default_client();
globalForClient.admin_client = client;
