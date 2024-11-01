import { PodMeta } from "./config/pods";

export interface CachedToken {
    token: string;
    expires_at: number;
    created_at: number;
}

const node_fetch = fetch;

const TOKEN_PATH = "/oauth/token";

export interface Collection {
    'collection-id': string;
    name: string;
};
export interface CollectionDetail {
    'collection-id': number,
    name: string;
    storage: {
        type: string;
        url: string;
    };
    dlt: {
        type: string;
        'user-id': number;
    }
};
export interface Object {
    'object-id': number;
    name: string;
};
export interface ObjectMeta {
    "type": string;
    "organization-id": string;
    "delete": boolean;
    "collection-id": string;
    "dri": string; //something?? "ZZZZZZZZm2Rfzzybt5hjiQ2XG2tFB7WtfuMBk>>>>>>>>",  //yes thats edited
    "created-at": string;
    "updated-at": string;
    "object-id": string;
};
export interface ObjectDetail {
    'object-id': number;
    'collection-id': number;
    name: string;
}

export default class PodAPIClient {
    client_id: string;
    client_secret: string;
    podmeta: PodMeta;

    base_url: string;

    cached_token: CachedToken | undefined;
    refetch_token_task: Promise<void> | undefined;

    constructor(client_id: string, client_secret: string, podmeta: PodMeta) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.podmeta = podmeta;

        this.base_url = `https://${this.podmeta.name}.${this.podmeta.server}`;

        this.get_token().catch(e => { throw e; });
    }

    get _is_token_valid() {
        if(!this.cached_token)
            { return false; }
        
        let expires_at = this.cached_token.expires_at;
        let now = Math.floor(Date.now() / 1000);

        if(expires_at > now) 
            { return true; }
        else
            { return false; }
    }

    parse_headers(headers: Headers) {
        let link_hdr  = headers.get("link"),
            curr_hdr  = headers.get("current-page"),
            total_hdr = headers.get("total-pages");

        if(
            !link_hdr  || 
            !total_hdr || 
            !curr_hdr
        ) { return; }

        let links_split = link_hdr.split(", ");
        let relative_pages: { [key: string]: number } = {};
        for(const link of links_split) {
            let split = link.split("; ");
            let id = parseInt(
                new URL(
                    split[0].replaceAll("<", "").replaceAll(">", "")
                ).searchParams.get("page")!!
            );
            let type = split[1].split("=")[1].replaceAll('"', '');
            relative_pages[type] = id;
        }

        let total = parseInt(total_hdr) ?? -1;
        let curr = parseInt(curr_hdr) ?? -1;

        return {
            relative_pages,
            total,
            curr
        };
    }

    async get_token() {
        // prepare request data
        let data = new URLSearchParams();
        data.set('grant_type', 'client_credentials');
        data.set('scope', 'write');
        data.set('client_id', this.client_id);
        data.set('client_secret', this.client_secret);
        
        // fetch with vanilla / node fetch
        let res = await node_fetch(`${this.base_url}${TOKEN_PATH}`, {
            method: 'POST',
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: data.toString(),
        });
        
        let json = await res.json();

        if(!json["access_token"])
            { return; }

        // cache the token
        let token: CachedToken = {
            token: json["access_token"],
            created_at: json["created_at"],
            expires_at: json["created_at"] + json["expires_in"]
        };

        this.cached_token = token;
        this.refetch_token_task = undefined;  // reset token task if it was set
    }

    trigger_refetch() {  // runs on every request, refreshes on demand
        if(
            this._is_token_valid || 
            !!this.refetch_token_task
        ) { return; }
        this.refetch_token_task = this.get_token();
    }

    // fetch override so we auto-insert the token
    async fetch(input: URL | string | globalThis.Request, init?: RequestInit): Promise<Response> {
        this.trigger_refetch();      // try refetch
        if(this.refetch_token_task)  // if we suddenly have a task,
            { await this.refetch_token_task; }  // we await it

        // from here on we ALWAYS have a token

        if(!init) init = {};
        if(!init.headers) init.headers = {};
        Object.assign(init.headers!!, { "Authorization": `Bearer ${this.cached_token!!.token}` });

        return node_fetch(input, init);  // and pass off to vanilla / node fetch
    }

    // all of the functions below this essentially do the same thing
    async get_collections() {
        let res = await this.fetch(`${this.base_url}/collection/list`);
        let json: Collection[] = await res.json();
        return json;
    }

    async get_collection(collection_id: number) {
        let res = await this.fetch(`${this.base_url}/collection/${collection_id}/list`);
        let json: CollectionDetail = await res.json();
        return json;
    }

    async get_objects(collection_id: number, page_id: number = 1) {
        let res = await this.fetch(`${this.base_url}/collection/${collection_id}/objects?page=${page_id}`);
        let headers = res.headers;
        let parsed_headers = this.parse_headers(headers);

        let json: Object[] = await res.json();
        return [json, parsed_headers];
    }

    async get_object(object_id: number) {
        let res = await this.fetch(`${this.base_url}/object/${object_id}`);
        let json: ObjectDetail = await res.json();
        return json;
    }

    async get_object_meta(object_id: number) {
        let res = await this.fetch(`${this.base_url}/object/${object_id}/meta`);
        let json: ObjectMeta = await res.json();
        return json;
    }
    
    async read_object(object_id: number) {
        let res = await this.fetch(`${this.base_url}/object/${object_id}/read`);
        let json: any = await res.json();
        return json;
    }

    async get_logs(user_id: string) {
        let res = await this.fetch(`${this.base_url}/logs/${user_id}`);
        let json: any = await res.json();
        return json;
    }

    async get_contracts(user_id: string) {
        let res = await this.fetch(`${this.base_url}/contracts/${user_id}`);
        let json: any = await res.json();
        return json;
    }

    async submit_d2a(form_data: any, user_id: string) {
        let body = {
            user_id,
            "data": form_data
        };

        let res = await this.fetch(`${this.base_url}/api/d2a_submit`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });

        let json: any = await res.json();
        Object.assign(json, { "status_code": res.status });
        return json;
    }

    async submit_d3a(form_data: any, object_id: string, user_id: string) {
        let body = {
            user_id,
            object_id,
            "data": form_data
        };

        let res = await this.fetch(`${this.base_url}/api/d3a_submit`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });

        let json: any = await res.json();
        Object.assign(json, { "status_code": res.status });
        return json;
    }

}