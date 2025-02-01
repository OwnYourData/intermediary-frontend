import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const GODATA_ADMIN_URL = "https://admin.go-data.at/welcome?";

function render_redirect(redirect_url: URL) {
    return `
    <script>
      setTimeout(() => window.location.href = "${redirect_url.toString()}", 500);
      window.opener.postMessage("identity:wallet:init", "*");
    </script>
    <h1>Please wait.</h1><br />
    <p>You are being redirected</p>
    `;
}

export async function GET(req: NextRequest) {
    let session = await getSession();

    if(!(session.is_logged_in && session.is_verified))
        { return redirect("/api/login?next=/user/profile"); }

    let state = crypto.randomBytes(16).toString('hex');  // generate a random state
    session.state_token = state;
    await session.save();  // save to session so noone manipulates it 

    let sp = new URLSearchParams();
    sp.append("state", state);
    sp.append("user", session.user!!.bPK);
    
    let url = new URL(GODATA_ADMIN_URL + sp.toString());  // make url,
    return new NextResponse(render_redirect(url), {   // and render a redirect for user
        headers: { 'content-type': 'text/html;charset=utf-8' }
    });
}

