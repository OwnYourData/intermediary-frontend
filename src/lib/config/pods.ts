export interface PodMeta {
    server: string,
    name: string
}

export function podmeta_from_string(txt: string): PodMeta {
    let url;
    try {
        url = new URL(txt);
    } catch(e: any) {
        return { "name": "", "server": "" };
    }

    let split_hostname = url.hostname.split(".");
    if(split_hostname.length < 3) 
        { throw Error("Invalid String"); }

    return {
        "name": split_hostname.shift()!!,
        "server": split_hostname.join(".")
    };
}

const pods: PodMeta[] = [
    podmeta_from_string("https://eeg.go-data.at/"),
    podmeta_from_string("https://concrete.go-data.at/"),
    podmeta_from_string("https://babelfish.data-container.net/"),
];

export default pods;