import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sharedDataCatalogueClient";

export async function DELETE(req: NextRequest) {
    let session = await getSession();

    if(!session.is_verified)
        return new NextResponse("", { status: 403 });

    let body = await req.json();
    if(!Object.keys(body).includes("object_id") || body["object_id"] === undefined)
        { return new NextResponse("bad req", { status: 400 }); }

    let res = await client.delete_catalogue_entry(body["object_id"], session.user?.bPK!!);
    
    let code = res["status_code"];
    delete res["status_code"];

    return new NextResponse(JSON.stringify({ res }), {
        headers: {
            'content-type': "application/json"
        },
        status: code
    });
}