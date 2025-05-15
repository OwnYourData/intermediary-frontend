"use server";

import { ObjectWithMeta, Pagination, SoyaMetadata, Object as APIObject } from "@/lib/AdminAPIClient";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export interface FetchEntriesReturnType extends Object, Partial<ObjectWithMeta> {
    d2a?: SoyaMetadata;
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

            newObject.d2a = (newObject.schema && newObject["tag"]) &&
                { "schema": newObject.schema, "_soya-tag": newObject["tag"] };
        } catch(e: any) {}

        data.push(newObject as FetchEntriesReturnType); 
    }

    return {
        data,
        "pagination": r[1] as Pagination
    };
}
