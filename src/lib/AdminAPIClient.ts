import { ADMIN_CLIENT, ADMIN_HOST, ADMIN_SECRET } from "./config";

export interface CachedToken {
    token: string;
    expires_at: number;
    created_at: number;
}

const node_fetch = fetch;

const TOKEN_PATH = "/oauth/token";

export interface DataCatalogueEntry {
    host: string;
    key: string;
    secret: string;
    collections: number[];
}

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
};
export interface Pagination {
    relative_pages: { [key: string]: number };
    total: number;
    curr: number;
};

export default class AdminAPIClient {
    client_id: string = ADMIN_CLIENT;
    client_secret: string = ADMIN_SECRET;

    base_url: string;

    cached_token: CachedToken | undefined;
    refetch_token_task: Promise<void> | undefined;

    constructor() {
        this.base_url = `https://${ADMIN_HOST}`;
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

    parse_headers(headers: Headers): Pagination | undefined {
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

        if(!json["access_token"]) {
            throw Error("Failed authenticating to backend!!");
        }

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
            !!this.refetch_token_task ||
            this.cached_token
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
    async get_data_catalogue(page: number = 1) {
        let res = await this.fetch(`${this.base_url}/api/data_catalog?page=${page}`);
        let json: DataCatalogueEntry[] = await res.json()!!;

        if(res.status !== 200) 
            { throw Error(JSON.stringify(json)); }

        let headers = res.headers;
        let pagination = this.parse_headers(headers);

        return [json, pagination];
    }

    async get_service_catalogue(page: number = 1) {
        let res = await this.fetch(`${this.base_url}/api/service_catalog?page=${page}`);
        let headers = res.headers;
        let pagination = this.parse_headers(headers);

        let json: Object[] = await res.json();
        return [json, pagination];
    }

    async get_logs(bPK: string, page: number = 1) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);
        sp.set("page", page.toString());

        let res = await this.fetch(`${this.base_url}/api/logs?${sp.toString()}`);
        let headers = res.headers;
        let pagination = this.parse_headers(headers);

        let json: any[] = await res.json();
        return [json, pagination];
    }

    async get_log(log_id: string, bPK: string) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);

        let res = await this.fetch(`${this.base_url}/api/log/${log_id}?${sp.toString()}`);
        let json: any = await res.json();
        return json;
    }

    async get_contracts(bPK: string, page: number = 1) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);
        sp.set("page", page.toString());

        let res = await this.fetch(`${this.base_url}/api/contracts?${sp.toString()}`);
        let headers = res.headers;
        let pagination = this.parse_headers(headers);

        let json: Object[] = await res.json();
        return [json, pagination];
    }

    async get_pods() {
        let res = await this.fetch(`${this.base_url}/api/pods`);
        let json: any = await res.json();
        return json;
    }

    async get_assets(bPK: string, page: number = 1) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);
        sp.set("page", page.toString());

        let res = await this.fetch(`${this.base_url}/api/assets?${sp.toString()}`);
        let headers = res.headers;
        let pagination = this.parse_headers(headers);

        let json: Object[] = await res.json();
        return [json, pagination];
    }

    async get_object_meta(object_id: number) {
        let res = await this.fetch(`${this.base_url}/object/${object_id}/meta`);
        let json: ObjectMeta = await res.json();

        if(res.status !== 200) 
            { throw Error(JSON.stringify(json)); }

        return json;
    }
    
    async read_object(object_id: number) {
        let res = await this.fetch(`${this.base_url}/object/${object_id}/read`);
        let json: any = await res.json();

        if(res.status !== 200) 
            { throw Error(JSON.stringify(json)); }

        return json;
    }

    async delete_contract(object_id: number, user_id: string) {
        let body = {
            "type": "contract",
            "id": object_id,
            "user": user_id
        };

        let res = await this.fetch(`${this.base_url}/api/delete`, {
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

    async delete_asset(object_id: number, user_id: string) {
        let body = {
            "type": "asset",
            "id": object_id,
            "user": user_id
        };

        let res = await this.fetch(`${this.base_url}/api/delete`, {
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

    async delete_log(object_id: number, log_id: string, user_id: string) {
        let body = {
            "type": "log",
            "id": object_id,
            "log-id": log_id,
            "user": user_id
        };

        let res = await this.fetch(`${this.base_url}/api/delete`, {
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

    // TODO below here!!
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

    async submit_d3a(form_data: any, object_id: number, user_id: string) {
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
    async delete_catalogue_entry(object_id: number, user_id: string) {
        let body = {
            "type": "catalog",
            "id": object_id,
            "user": user_id
        };

        let res = await this.fetch(`${this.base_url}/api/delete`, {
            method: "DELETE",
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
