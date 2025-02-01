import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sharedDataCatalogueClient";

export async function GET(req: NextRequest) {
    let session = await getSession();

    if(!session.is_verified)
        return new NextResponse("", { status: 403 });

    let r = await client.get_logs(session.user?.bPK!!);
    return new NextResponse(JSON.stringify(r), {
        headers: {
            'content-type': "application/json"
        }
    });
}

export async function DELETE(req: NextRequest) {
    let session = await getSession();

    if(!session.is_verified)
        return new NextResponse("", { status: 403 });

    let body = await req.json();
    if(
        body["object_id"] === undefined || 
        body["log_id"]    === undefined
    ) { return new NextResponse("bad req", { status: 400 }); }

    let res = await client.delete_log(body["object_id"], body["log_id"], session.user?.bPK!!);

    let code = res["status_code"];
    delete res["status_code"];

    return new NextResponse(JSON.stringify({ res }), {
        headers: {
            'content-type': "application/json"
        },
        status: code
    });
}