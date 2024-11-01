import { enforceAuthAndVerify } from "@/lib/session";
import MyDataClient from "./client_page";

export default async function MyData() {
    return await enforceAuthAndVerify() ?? <MyDataClient />;
}