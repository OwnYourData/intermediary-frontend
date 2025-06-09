import { NextRequest } from "next/server";
import crypto from 'crypto';
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const ID_AUSTRIA_URL = "https://eid.oesterreich.gv.at/auth/idp/profile/oidc/authorize?response_type=code&client_id=https%3A%2F%2Fidaustria.ownyourdata.eu&redirect_uri=https%3A%2F%2Fidaustria.ownyourdata.eu%2Fconnect&scope=openid+profile+eid&state=disp:";

export async function GET(req: NextRequest) {
  let session = await getSession();

  if(session.is_logged_in)  // if we are logged in no need to do this again
    { return redirect("/api/login?from=idaustria"); }

  let state = crypto.randomBytes(16).toString('hex');  // generate a random state
  session.state_token = state;
  await session.save();  // save to session so noone manipulates it 

  let url = new URL(ID_AUSTRIA_URL + state);  // make url,
  return redirect(url.toString());   // and render a redirect for user
}

