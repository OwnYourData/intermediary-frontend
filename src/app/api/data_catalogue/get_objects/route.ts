import { type Object } from "@/lib/PodAPIClient";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sharedDataCatalogueClient";
import * as config from "@/lib/config";

export async function GET(req: NextRequest) {
    let session = await getSession();
    if(!session.is_verified)
        { return new NextResponse("", { status: 403 }); }    

    let req_url = new URL(req.url);
    let sp = req_url.searchParams;

    let page_str = sp.get("page") ?? "1";
    let page = parseInt(page_str);
    if(Number.isNaN(page))
        page = 1;

    const COLLECTION = config.CATALOGUE_COLLECTION;

    let [fetched_data, parsed] = await client.get_objects(parseInt(COLLECTION), page);
    
    if(Object.keys((fetched_data as any)).includes('error')) {
        return new NextResponse(JSON.stringify(fetched_data), {
            "headers": { "content-type": "application/json" },
            "status": 400
        });
    }
    
    let data: any[] = [];
    for(let el of fetched_data as Object[]) {
        let id = el["object-id"];
        let meta = await client.get_object_meta(id);
        Object.assign(el, meta);
        data.push(el);
    }
    
    let r = {
        data,
        "pagination": parsed
    };

    return new NextResponse(JSON.stringify(r), {
        "headers": { "content-type": "application/json" }
    });
}