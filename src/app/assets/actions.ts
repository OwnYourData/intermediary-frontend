"use server";

import { Pagination } from "@/lib/AdminAPIClient";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export async function fetchAssets(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.get_assets(session.user.bPK, page);
    return {
        "data": r[0],
        "pagination": r[1] as Pagination | undefined
    };
}

export async function fetchPods() {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.get_pods();
    console.log(r);
    return r;
}

export async function deleteAsset(object_id: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.delete_asset(object_id, session.user.bPK);
    if(r["status_code"] != 200)
        throw Error("Deletion Failed");
    return r;
}

export async function saveD2A(data: any) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");


}
