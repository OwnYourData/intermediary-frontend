import * as config from "@/lib/config";

export async function fetchServices() {
    let res = await fetch(config.SERVICES_URL);
    let json = await res.json();

    if(res.status !== 200) 
        { throw Error(JSON.stringify(json)); }
    
    return json;
}

export async function fetchObjects(page: number) {
    let res = await fetch(`/api/data_catalogue/get_objects?page=${page}`);
    let json = await res.json();

    if(res.status !== 200) 
        { throw Error(JSON.stringify(json)); }
    
    return json;
}

export async function fetchObject(object_id: string) {
    let res = await fetch(`/api/data_catalogue/get_object_data?id=${object_id}`);
    let json = await res.json();

    if(res.status !== 200) 
        { throw Error(JSON.stringify(json)); }
    
    return json;
}

export async function deleteObject(object_id: string) {
    let res = await fetch("/api/data_catalogue/delete", {
        method: "DELETE",
        body: JSON.stringify({ object_id }),
        headers: { "content-type": "application/json" }
    });
    let json = await res.json();
    return json;
}

export async function postD2A(data: any) {
    let res = await fetch("/api/data_catalogue/submit", {
        body: JSON.stringify({ data, "type": "d2a" }),
        method: "POST"
    });
    let json = await res.json();

    if(res.status !== 200) 
        { throw Error(JSON.stringify(json)); }

    return json;
}

export async function postD3A(data: any, object_id: string) {
    let res = await fetch("/api/data_catalogue/submit", {
        body: JSON.stringify({ data, object_id, "type": "d3a" }),
        method: "POST"
    });
    let json = await res.json();

    if(res.status !== 200) 
        { throw Error(JSON.stringify(json)); }

    return json;
}
