import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {

    return new NextResponse(JSON.stringify({"please": "wait"}), {
        headers: { "content-type": "application/json" }
    });
}
