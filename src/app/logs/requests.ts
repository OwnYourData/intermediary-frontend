export async function fetchLogs() {
    let res = await fetch("/api/logs");
    let json = await res.json();
    return json;
}