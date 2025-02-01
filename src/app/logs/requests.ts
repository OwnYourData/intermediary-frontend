export async function fetchLogs() {
    let res = await fetch("/api/logs");
    let json = await res.json();
    return json;
}

export async function deleteLog(object_id: string, log_id: string) {
    let res = await fetch("/api/logs", {
        method: "DELETE",
        body: JSON.stringify({ object_id, log_id }),
        headers: { "content-type": "application/json" }
    });
    let json = await res.json();
    return json;
}