"use server";

import { ObjectWithMeta, Pagination, SoyaMetadata, Object as APIObject, ResponseBase } from "@/lib/AdminAPIClient";
import { SA_SIGN } from "@/lib/config";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export interface FetchEntriesReturnType extends Object, Partial<ObjectWithMeta> {
    spa?: SoyaMetadata;
    sea?: SoyaMetadata;
}

export async function fetchEntries(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");
    
    const r = await client.get_service_catalogue(page);
    let data: FetchEntriesReturnType[] = [];

    for(let obj of r[0] as APIObject[]) {
        if(!obj["object-id"]) continue;
        
        let newObject: any = { ...obj };
        try {
            let meta = await client.get_object_meta(obj["object-id"]);
            newObject = { ...obj, ...meta };

            newObject.spa = newObject.schema &&
                { "schema": newObject.schema, "tag": newObject["tag"] };
            newObject.sea = newObject.button;
            delete newObject.button;
        } catch(e: any) {}

        data.push(newObject as FetchEntriesReturnType); 
    }

    return {
        data,
        "pagination": r[1] as Pagination
    };
}


export async function saveSEA(data: any, schema: string, object_id?: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.submit_sa(data, schema, "data", session.user.bPK, object_id);
    if((r as any as ResponseBase)["status_code"] != 200)
        throw Error("Saving failed!");
    return r;
}

export async function generateSignSEARedirect(object_id: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let body = {
        "id": object_id,
        "bpk": session.user.bPK 
    };
    //const token = await client.use_backend_datastore(JSON.stringify(body));
    //return `${SA_SIGN}?token=${token}`;
    return `${SA_SIGN}?${(new URLSearchParams(body as Record<string, any>)).toString()}`;
}
