"use server";

import { DataCatalogueEntry, Pagination } from "@/lib/AdminAPIClient";
import PodAPIClient, { CollectionDetail, podmeta_from_string } from "@/lib/PodAPIClient";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export async function fetchEntries(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    const r = await client.get_data_catalogue(page);
    
    let data: CollectionDetail[] = [];

    for(const pod of r[0] as DataCatalogueEntry[]) {
        const meta = podmeta_from_string(pod.host);
        console.log(pod);
        const podClient = new PodAPIClient(pod.key, pod.secret, meta);
        for(const collection of pod.collections) {
            const info = await podClient.get_collection(collection);
            data.push(info);
        }
    }

    return {
        data,
        pagination: r[1] as Pagination
    };
}

export async function deleteEntry(object_id: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");
    
    let r = await client.delete_object(object_id, session.user.bPK);
    if(r["status_code"] != 200)
      throw Error("Deletion Failed");

    return r;
}

