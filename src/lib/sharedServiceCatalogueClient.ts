import { podmeta_from_string } from "./config/pods";
import PodAPIClient from "./PodAPIClient";
import * as config from "./config";

const globalForClient = globalThis as unknown as { services_client: PodAPIClient };

export const client = 
    globalForClient.services_client || new PodAPIClient(process.env.USER_KEY!!, process.env.USER_SECRET!!, podmeta_from_string(config.SERVICES_HOST));

if (process.env.NODE_ENV !== 'production') globalForClient.services_client = client;
