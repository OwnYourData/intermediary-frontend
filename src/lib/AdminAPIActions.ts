"use server";

import { getSession } from "./session";
import { client } from "./sharedAdminClient";

export async function fetchObject(object_id: string) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.read_object(object_id);
    delete r["status_code"];
    return r;
}

