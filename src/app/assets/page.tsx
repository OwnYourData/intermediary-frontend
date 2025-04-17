import { enforceAuthAndVerify } from "@/lib/session";
import ContractsClient from "./client_page";
import { Suspense } from "react";
import Loading from "./loading";

export default async function Access() {
    return await enforceAuthAndVerify() ?? <Suspense fallback={<Loading />}><ContractsClient /></Suspense>;
}