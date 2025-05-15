import { getSession } from "@/lib/session";
import * as config from "@/lib/config";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { client } from "@/lib/sharedAdminClient";

interface TokenData {
  "state": string;
  "bpk": string;
  did: string | undefined;
  "valid-until": string | undefined;
}

export async function GET(req: NextRequest) {
    let session = await getSession();
    if(!(session.is_logged_in && session.is_verified))
        { return redirect("/api/login?next=/user/profile"); }
    
    let sp = new URL(req.url).searchParams;

    // no token means someone thought "hey let's just open that page and see what happens"
    let jwt = sp.get('token');
    if(jwt === null)  // "leave!!", that's what happens
        { return redirect("/user/profile"); }

    const pubkey = config.JWT_PUBKEY;

    let json;
    try {
        let { payload } = await jwtVerify(jwt, pubkey);
        json = payload as any as TokenData;
    }
    catch(e: any)
      { return redirect("/user/profile"); };

    const json_keys = Object.keys(json);

    if(!(  // if any of these keys are missing we have a REEEALLY funny person doing the request
        json_keys.includes("state") &&
        json_keys.includes("bpk")
    )) { return redirect("/user/profile"); }  // yeah no you're also not getting anywhere :3

    if(!session.state_token) // without this property we're also not getting anywhere
        { return redirect("/user/profile"); }  // get out

    const json_state = json["state"];
    let csrf_value = session.state_token;

    if(csrf_value !== json_state || 
       session.user!!.bPK !== json["bpk"])  // state or user mismatch means bad
        { return redirect("/user/profile"); }  // get out now

    session.state_token = undefined;
    await session.save();

    if(!json_keys.includes("did") || !json_keys.includes("valid-until"))
        { return redirect("/user/profile"); }

    let did = json["did"]!!;
    let valid_until = new Date(json["valid-until"]!!);

    // delete old DID if exists
    //await prisma.walletDID.deleteMany({
    //    where: {
    //        bPK: session.user!!.bPK
    //    }
    //});

    // create WalletDID in DB
    //await prisma.walletDID.create({
    //    data: {
    //        did: did,
    //        valid_until: valid_until,
    //        user: {
    //            connect: { bPK: session.user!!.bPK }
    //        }
    //    }
    //});
  
    await client.update_user({
        "bpk": session.user!!.bPK,
        "current_did": {
            did,
            valid_until: valid_until.toISOString()
        }
    });

    return redirect("/user/profile"); // only now did the user make it
}

