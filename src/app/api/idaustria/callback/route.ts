import { SessionData, UserData } from "@/lib/config/session-config";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

function render_result(status: string) {
    return`
    <script>window.auth_status="${status}";</script>
    <script src="/js/idaustria_callback.js">/* This has gotten too long so it's a script now */</script>
    <h1>Please wait.</h1><br />
    <p>You are being redirected</p>
    `;
}

const unauthorized = () => new NextResponse(render_result('noauth'), {
    status: 401,
    statusText: "Not Authorized",
    headers: { 'content-type': 'text/html;charset=utf-8' }
});

const authorized = () => new NextResponse(render_result('auth'), {
    status: 200,
    statusText: "Authorized",
    headers: { 'content-type': 'text/html;charset=utf-8' }
});

export async function GET(req: NextRequest) {
    let session = await getSession();
    let sp = new URL(req.url).searchParams;

    // no token means someone thought "hey let's just open that page and see what happens"
    let jwt = sp.get('token');
    if(jwt === null)  // "leave!!", that's what happens
        { return unauthorized(); }

    const [headerEncoded, payloadEncoded, signature] = jwt.split('.');  // TODO: Implement Signing Check, although I think Christoph strips all signature stuff from the JWT
    const payloadJson = Buffer.from(payloadEncoded, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);  // parse payload
    const payload_keys = Object.keys(payload);

    if(!(  // if any of these keys are missing we have a REEEALLY funny person doing the request
        payload_keys.includes("state") &&
        payload_keys.includes("given_name") &&
        payload_keys.includes("family_name") &&
        payload_keys.includes("urn:pvpgvat:oidc.bpk") &&
        payload_keys.includes("org.iso.18013.5.1:resident_postal_code")
    )) { return unauthorized(); }  // yeah no you're also not getting anywhere :3
    
    if(!session.state_token) // without this property we're also not getting anywhere
        { return unauthorized(); }  // get out

    const jwt_state = payload["state"];
    let csrf_value = session.state_token;

    if(`disp:${csrf_value}` !== jwt_state)  // state mismatch means bad
        { return unauthorized(); }  // get out now

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

    return authorized();  // only now did the user make it
}