"use server";

import { Pagination } from "@/lib/AdminAPIClient";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";

export async function fetchEntries(page: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");
    
    const [data, pagination] = await client.get_service_catalogue(page);
    return {
        data,
        "pagination": pagination as Pagination
    };
}
