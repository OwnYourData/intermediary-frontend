"use server";

import { Object as APIObject, ObjectWithMeta, Pagination } from "@/lib/AdminAPIClient";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export async function fetchContracts(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.get_contracts(session.user.bPK, page);
    let data: ObjectWithMeta[] = [];

    for(let obj of r[0] as APIObject[]) {
        let meta = await client.get_object_meta(obj["object-id"]);
        Object.assign(obj, meta);
        data.push(obj as ObjectWithMeta); 
    }

    return {
        "data": data,
        "pagination": r[1] as Pagination | undefined
    };
}

export async function deleteContract(object_id: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.delete_object("contracts", object_id, session.user.bPK);
    if(r["status_code"] != 200)
        throw Error("Deletion Failed");
    return r;
}
