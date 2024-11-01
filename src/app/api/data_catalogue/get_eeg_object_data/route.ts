import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sharedEEGClient";

export async function GET(req: NextRequest) {
    let session = await getSession();
    if(!session.is_verified)
        { return new NextResponse("", { status: 403 }); }    

    let req_url = new URL(req.url);
    let sp = req_url.searchParams;

    let id_str = sp.get("id");
    if(id_str === null)
        { return new NextResponse("", { status: 400 }); }
    let id = parseInt(id_str);

    let data = await client.read_object(id);

    return new NextResponse(JSON.stringify(data), {
        "headers": {
            "content-type": "application/json"
        }
    });
}