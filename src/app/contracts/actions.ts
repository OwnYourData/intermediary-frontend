"use server";

import { Pagination } from "@/lib/AdminAPIClient";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export async function fetchContracts(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.get_contracts(session.user.bPK, page);
    return {
        "data": r[0],
        "pagination": r[1] as Pagination | undefined
    };
}

export async function deleteContract(object_id: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.delete_contract(object_id, session.user.bPK);
    if(r["status_code"] != 200)
        throw Error("Deletion Failed");
    return r;
}
