export async function fetchObjects(page: number) {
    let res = await fetch(`/api/service_catalogue/get_objects?page=${page}`);
    let json = await res.json();

    if(res.status !== 200) 
        { throw Error(JSON.stringify(json)); }
    
    return json;
}

export async function fetchObject(object_id: string) {
    let res = await fetch(`/api/service_catalogue/get_object_data?id=${object_id}`);
    let json = await res.json();

    if(res.status !== 200) 
        { throw Error(JSON.stringify(json)); }
    
    return json;
}
