import { SessionData, UserData } from "@/lib/config/session-config";
import * as config from "@/lib/config";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

interface TokenData {
  state: string;
  given_name: string;
  family_name: string;
  "urn:pvpgvat:oidc.bpk": string;
  "org.iso.18013.5.1:resident_postal_code": string;
}

export async function GET(req: NextRequest) {
    let session = await getSession();
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
      { return redirect("/api/login"); }
    
    const payload_keys = Object.keys(payload);

    if(!(  // if any of these keys are missing we have a REEEALLY funny person doing the request
        payload_keys.includes("state") &&
        payload_keys.includes("given_name") &&
        payload_keys.includes("family_name") &&
        payload_keys.includes("urn:pvpgvat:oidc.bpk") &&
        payload_keys.includes("org.iso.18013.5.1:resident_postal_code")
    )) { return redirect("/api/login"); }  // yeah no you're also not getting anywhere :3
    
    if(!session.state_token) // without this property we're also not getting anywhere
      { return redirect("/api/login"); }  // get out

    const jwt_state = payload["state"];
    let csrf_value = session.state_token;

    if(`disp:${csrf_value}` !== jwt_state)  // state mismatch means bad
      { return redirect("/api/login"); }  // get out now

    // from here on we assume the user actually exists

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

    return redirect("/api/login");  // only now did the user make it
}
