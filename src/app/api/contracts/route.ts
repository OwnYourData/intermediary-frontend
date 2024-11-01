import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sharedEEGClient";

export async function GET(req: NextRequest) {
    let session = await getSession();

    if(!session.is_verified)
        return new NextResponse("", { status: 403 });

    let r = await client.get_contracts(session.user?.bPK!!);
    return new NextResponse(JSON.stringify(r), {
        headers: {
            'content-type': "application/json"
        }
    });
}