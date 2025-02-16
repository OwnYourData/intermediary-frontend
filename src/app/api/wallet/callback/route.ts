import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    let session = await getSession();
    let json = await req.json();   
    let json_keys = Object.keys(json);

    NextResponse.redirect("", { status: 302 });

    if(!(session.is_logged_in && session.is_verified))
        { return NextResponse.redirect("/api/login?next=/user/profile", { status: 302 }); }

    if(!(  // if any of these keys are missing we have a REEEALLY funny person doing the request
        json_keys.includes("state") &&
        json_keys.includes("user-id")
    )) { return NextResponse.redirect("/user/profile", { status: 302 }); }  // yeah no you're also not getting anywhere :3
    
    if(!session.state_token) // without this property we're also not getting anywhere
        { return NextResponse.redirect("/user/profile", { status: 302 }); }  // get out

    const json_state = json["state"];
    let csrf_value = session.state_token;

    if(csrf_value !== json_state)  // state mismatch means bad
        { return NextResponse.redirect("/user/profile", { status: 302 }); }  // get out now

    if(!json_keys.includes("did") || !json_keys.includes("valid-until"))
        { return NextResponse.redirect("/user/profile", { status: 302 }); }

    let did = json["did"];
    let valid_until = new Date(json["valid-until"]!!);

    // create WalletDID in DB
    await prisma.walletDID.create({
        data: {
            did: did,
            valid_until: valid_until,
            user: {
                connect: { bPK: session.user!!.bPK }
            }
        }
    });

    return NextResponse.redirect("/user/profile");  // only now did the user make it
}

