"use server";

import { Object as APIObject, ObjectWithMeta, Pagination, ResponseBase } from "@/lib/AdminAPIClient";
import { ADMIN_HOST, DA_SIGN } from "@/lib/config";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export async function fetchAssets(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.get_assets(session.user.bPK, page);
    let data: ObjectWithMeta[] = [];

    for(let obj of r[0] as APIObject[]) {
        let meta = await client.get_object_meta(obj["object-id"]);
        Object.assign(obj, meta);
        data.push(obj as ObjectWithMeta); 
    }
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
    return r;
}

export async function deleteAsset(object_id: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.delete_object("assets", object_id, session.user.bPK);
    if(r["status_code"] != 200)
        throw Error("Deletion Failed");
    return r;
}

export async function saveD2A(data: any, schema: string, object_id?: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.submit_da(data, schema, "assets", session.user.bPK, object_id);
    console.log(r);
    if((r as any as ResponseBase)["status_code"] != 200)
        throw Error("Saving failed!");
    return r;
}

export async function generateSignD2ARedirect(data: any, schema: string, object_id?: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let obj = await saveD2A(data, schema, object_id);
    object_id = obj["object-id"];
    
    let body = {
        "id": object_id,
        "bpk": session.user.bPK 
    };
    //const token = await client.use_backend_datastore(JSON.stringify(body));
    //return `${DA_SIGN}?token=${token}`;
    return `${DA_SIGN}?${(new URLSearchParams(body as Record<string, any>)).toString()}`;
}
