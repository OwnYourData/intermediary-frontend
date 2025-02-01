import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sharedDataCatalogueClient";

export async function POST(req: NextRequest) {
    let session = await getSession();
    if(!session.is_logged_in || !session.user)
        { return new NextResponse("no thank you we don't want your unauthenticated data :)", {status: 401}); }

    let body = await req.json();        
    let keys = Object.keys(body);

    let res;

    switch (body.type) {
        case "d2a":    
            if(!keys.includes("data"))
                { return new NextResponse("bad request", {status: 400}); }

            res = await client.submit_d2a(body["data"], session.user.bPK);

            break;
    
        case "d3a":
            if(
                !keys.includes("data") && 
                !keys.includes("object_id")
            )
                { return new NextResponse("bad request", {status: 400}); }

            res = await client.submit_d3a(body["data"], body["object_id"], session.user.bPK);            
            
            break;
    
        default:
            return new NextResponse("bad request", {status: 400});
    }

    let code = res["status_code"];
    delete res["status_code"];

    return new NextResponse(JSON.stringify({ res }), { status: code });

}