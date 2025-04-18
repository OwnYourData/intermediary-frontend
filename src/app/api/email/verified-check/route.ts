import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  let session = await getSession();
  if(!session.is_logged_in || !session.user) {
      return new NextResponse(JSON.stringify({ "goto": "/api/login" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
      });
  }

  if(session.is_logged_in && session.is_verified) {
      return new NextResponse(JSON.stringify({ "goto": "/api/login?next=/user/profile" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
      });
  } else { return new NextResponse("", { status: 404 }); }
}

