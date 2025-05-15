"use server";

import { Object as APIObject, ObjectWithMeta, Pagination, ResponseBase, SoyaMetadata } from "@/lib/AdminAPIClient";
import { DA_SIGN } from "@/lib/config";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export interface FetchEntriesReturnType extends Object, Partial<ObjectWithMeta> {
    d2a?: SoyaMetadata;
    d3a?: SoyaMetadata;
}

export async function fetchEntries(page: number): Promise<{
    data: FetchEntriesReturnType[],
    pagination: Pagination
}> {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r_query = client.get_data_catalogue(page);
    let pods_query = client.get_pods();
    let data: FetchEntriesReturnType[] = [];

    let r = await r_query;
    let pods = await pods_query;
    
    for(let obj of r[0] as APIObject[]) {
        if(!obj["object-id"]) continue;
        
        let newObject: any = { ...obj };
        try {
            let meta = await client.get_object_meta(obj["object-id"]);
            newObject = { ...obj, ...meta };

            newObject.d2a = (newObject.schema && newObject["tag"]) &&
                { "schema": newObject.schema, "_soya-tag": newObject["tag"] };
            let matching = pods.filter(el => el.d2a.schema === newObject.d2a.schema);
            if(matching.length === 1) newObject.d3a = matching[0].d3a;
        } catch(e: any) {}

        data.push(newObject as FetchEntriesReturnType); 
    }

    return {
        data,
        pagination: r[1] as Pagination
    };
}

export async function deleteEntry(object_id: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.delete_object("data", object_id, session.user.bPK);
    if(r["status_code"] != 200)
        throw Error("Deletion Failed");
    return r;
}

export async function getD3AforD2A(d2a: SoyaMetadata) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");
    
    let pods = await client.get_pods();
    for(const pod of pods) {
        if(pod.d2a === d2a)
            return pod.d3a;
    }

    return null;
}

export async function saveD3A(data: any, schema: string, object_id?: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.submit_da(data, schema, "data", session.user.bPK, object_id);
    if((r as any as ResponseBase)["status_code"] != 200)
        throw Error("Saving failed!");
    return r;
}

export async function generateSignD3ARedirect(data: any, schema: string, object_id?: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let obj = await saveD3A(data, schema, object_id);
    object_id = obj["object-id"];
    
    let body = {
        "id": object_id,
        "bpk": session.user.bPK 
    };
    //const token = await client.use_backend_datastore(JSON.stringify(body));
    //return `${DA_SIGN}?token=${token}`;
    return `${DA_SIGN}?${(new URLSearchParams(body as Record<string, any>)).toString()}`;
}
