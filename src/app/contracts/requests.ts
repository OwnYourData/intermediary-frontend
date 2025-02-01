export async function fetchContracts() {
    let res = await fetch("/api/contracts");
    let json = await res.json();
    return json;
}

export async function deleteContract(object_id: string) {
    let res = await fetch("/api/contracts", {
        method: "DELETE",
        body: JSON.stringify({ object_id }),
        headers: { "content-type": "application/json" }
    });
    let json = await res.json();
    return json;
}