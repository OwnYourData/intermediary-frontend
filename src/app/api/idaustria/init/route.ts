import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const ID_AUSTRIA_URL = "https://eid.oesterreich.gv.at/auth/idp/profile/oidc/authorize?response_type=code&client_id=https%3A%2F%2Fidaustria.ownyourdata.eu&redirect_uri=https%3A%2F%2Fidaustria.ownyourdata.eu%2Fconnect&scope=openid+profile+eid&state=disp:";

function render_redirect(redirect_url: URL) {
    return `
    <script>
      setTimeout(() => window.location.href = "${redirect_url.toString()}", 500);
      window.opener.postMessage("identity:auth:init", "*");
    </script>
    <h1>Please wait.</h1><br />
    <p>You are being redirected</p>
    `;
}

export async function GET(req: NextRequest) {
    let session = await getSession();

    if(session.is_logged_in)  // if we are logged in no need to do this again
        { return redirect("/api/login?from=idaustria"); }

    let state = crypto.randomBytes(16).toString('hex');  // generate a random state
    session.state_token = state;
    await session.save();  // save to session so noone manipulates it 

    let url = new URL(ID_AUSTRIA_URL + state);  // make url,
    return new NextResponse(render_redirect(url), {   // and render a redirect for user
        headers: { 'content-type': 'text/html;charset=utf-8' }
    });
}

