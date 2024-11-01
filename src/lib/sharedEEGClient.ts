import { podmeta_from_string } from "./config/pods";
import PodAPIClient from "./PodAPIClient";

const globalForClient = globalThis as unknown as { client: PodAPIClient };

export const client = 
    globalForClient.client || new PodAPIClient(process.env.USER_KEY!!, process.env.USER_SECRET!!, podmeta_from_string("https://eeg.go-data.at/"));

if (process.env.NODE_ENV !== 'production') globalForClient.client = client;

    