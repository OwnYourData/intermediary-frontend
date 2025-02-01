import { enforceAuthAndVerify } from "@/lib/session";
import ServicesClient from "./client_page";

export default async function Services() {
    return await enforceAuthAndVerify() ?? <ServicesClient />;
}
