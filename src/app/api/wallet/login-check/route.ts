import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import * as config from "@/lib/config";


interface CheckResponse {
  login: boolean;
  token?: string;
}

export async function GET(req: NextRequest) {
  let session = await getSession();
  if(session.is_logged_in || !session.state_token)
    { return redirect("/api/login"); }

  let res = await fetch(`${config.QR_CHECK_URL}/${session.state_token}`);
  let json: CheckResponse = await res.json();

  if(res.status === 404 && json.login === false)
    return new NextResponse("", { status: 404 });

  else if (json.login == true && json.token) {
      session.state_token = undefined;
      await session.save();

      return new NextResponse(JSON.stringify({ "goto": `/api/wallet/login?token=${json.token}` }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
      });
  }

  return new NextResponse("server error", { status: 500 });
}

