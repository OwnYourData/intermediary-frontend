"use server";

import { getSession } from "./session";
import { client } from "./sharedAdminClient";

export async function fetchObject(object_id: number) {
    let session = await getSession();
    if(!session.is_verified || !session.user)
        throw Error("no-auth");

    let r = await client.read_object(object_id);
    return r;
}

