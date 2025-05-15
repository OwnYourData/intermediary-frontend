"use server";

import { Pagination, ResponseBase } from "@/lib/AdminAPIClient";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export async function fetchLogs(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.get_logs(session.user.bPK, page);
    return {
        "data": r[0],
        "pagination": r[1] as Pagination | undefined
    };
}

export async function fetchLog(log_id: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.get_log(log_id, session.user.bPK);
    if((r as any as ResponseBase)["status_code"] != 200)
        throw Error("Fetching Failed");
    delete (r as any as Partial<ResponseBase>)["status_code"];
    return r;
}

export async function deleteLog(object_id: string, log_id: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.delete_log(object_id, log_id, session.user.bPK);
    if(r["status_code"] != 200)
        throw Error("Deletion Failed");
    return r;
}
