import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import * as config from "@/lib/config";
import { SessionData, UserData } from "@/lib/config/session-config";
import { jwtVerify } from "jose";

interface TokenData {
  given_name: string;
  family_name: string;
  "org.iso.18013.5.1:resident_postal_code": string;
  "urn:pvpgvat:oidc.bpk": string;
}

export async function GET(req: NextRequest) {
    let session = await getSession();
    if(session.is_logged_in)
        { return redirect("/api/login"); }
    
    let sp = new URL(req.url).searchParams;

    // no token means someone thought "hey let's just open that page and see what happens"
    let jwt = sp.get('token');
    if(jwt === null)  // "leave!!", that's what happens
        { return redirect("/api/login"); }

    const pubkey = config.JWT_PUBKEY;

    let payload;
    try 
      { payload = (await jwtVerify(jwt, pubkey)).payload as any as TokenData; }
    catch(e: any)
      { return redirect("/api/login"); };

    const payload_keys = Object.keys(payload);

    if(!(  // if any of these keys are missing we have a REEEALLY funny person doing the request
        payload_keys.includes("given_name") &&
        payload_keys.includes("family_name") &&
        payload_keys.includes("urn:pvpgvat:oidc.bpk") &&
        payload_keys.includes("org.iso.18013.5.1:resident_postal_code")
    )) { return redirect("/api/login"); }  // yeah no you're also not getting anywhere :3

    // now we can assume the user actually exists!

    // construct session data
    let userData: UserData = {
        bPK: payload["urn:pvpgvat:oidc.bpk"],
        given_name: payload["given_name"],
        last_name: payload["family_name"],
        postcode: payload["org.iso.18013.5.1:resident_postal_code"]
    };

    let data: SessionData = {
        is_logged_in: true,
        is_verified: false,
        user: userData,
    };

    Object.assign(session, data);
    await session.save();  // and save it

    return redirect("/api/login"); // only now did the user make it
}

