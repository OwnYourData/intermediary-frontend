export async function fetchContracts() {
    let res = await fetch("/api/contracts");
    let json = await res.json();
    return json;
}