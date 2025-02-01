import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

const QR_PAYLOAD = "openid://?request_uri=https%3A%2F%2Fadmin.go-data.at%2Fagent%2Fsiop%2Fdefinitions%2FsphereonWallet%2Fauth-requests%2F";

export async function GET(req: NextRequest) {
    let uuid = randomUUID();

}
