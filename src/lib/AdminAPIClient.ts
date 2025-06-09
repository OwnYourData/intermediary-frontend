import { ADMIN_CLIENT, ADMIN_HOST, ADMIN_SECRET } from "./config";
import { UserData } from "./config/session-config";

export interface CachedToken {
    token: string;
    expires_at: number;
    created_at: number;
}

const node_fetch = fetch;

const TOKEN_PATH = "/oauth/token";

export interface ResponseBase {
  status_code: number;
}

export interface Object {
    'object-id': string;
    name: string;
};
export interface ObjectMeta extends SoyaMetadata {
    "type": string;
    "organization-id": string;
    "delete": boolean;
    "collection-id": string;
    "dri": string; //something?? "ZZZZZZZZm2Rfzzybt5hjiQ2XG2tFB7WtfuMBk>>>>>>>>",  //yes thats edited
    "created-at": string;
    "updated-at": string;
    "object-id": number;
    "button"?: SoyaMetadata;
};
export type ObjectWithMeta = Object & ObjectMeta;

export interface Pagination {
    relative_pages: { [key: string]: number };
    total: number;
    curr: number;
};

export interface SoyaMetadata {
    schema: string;
    tag?: string;
}
export interface Pod {
    id: number;
    name: string;
    d2a: SoyaMetadata;
    d3a: SoyaMetadata;
};

export interface LogObject {
  id: string,
  store_id: string,
  user: string,
  timestamp: string,
  event_type: number,
  event_object: any,
  event: string,
  created_at: string,
  updated_at: string,
}

export interface User extends UserData {
    "email": string | null,
    "current_did": {
        "did": string | null,
        "valid_until": string | null,
    } | null,
}
export interface UpdateUser extends Partial<User> {};

export type EmailPayload = {
  to: string
  subject: string
  html: string
}

export default class AdminAPIClient {
    client_id: string;
    client_secret: string;

    base_url: string;

    cached_token: CachedToken | undefined;
    refetch_token_task: Promise<void> | undefined;

    constructor(base_url: string, client_id: string, client_secret: string) {
        this.base_url = base_url;
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.get_token().catch(e => { throw e; });
    }

    static get_default_client() {
        return new this(`https://${ADMIN_HOST}`, ADMIN_CLIENT, ADMIN_SECRET);
    }

    _is_token_valid() {
        if(!this.cached_token)
            { return false; }
        
        let expires_at = this.cached_token.expires_at;
        let now = Math.floor(Date.now() / 1000);

        return expires_at > now; 
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
            this._is_token_valid() || 
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
    async get_data_catalogue(page: number = 1) {
        const res = await this.fetch(`${this.base_url}/api/data_catalog?page=${page}`);
        const headers = res.headers;
        const pagination = this.parse_headers(headers);

        let json: Object[] = await res.json()!!;
        //Object.assign(json, { "status_code": res.status });
        return [json, pagination];
    }

    async get_service_catalogue(page: number = 1) {
        const res = await this.fetch(`${this.base_url}/api/service_catalog?page=${page}`);
        const headers = res.headers;
        const pagination = this.parse_headers(headers);

        let json: Object[] = await res.json();
        //Object.assign(json, { "status_code": res.status });
        return [json, pagination];
    }

    async get_logs(bPK: string, page: number = 1) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);
        sp.set("page", page.toString());

        const res = await this.fetch(`${this.base_url}/api/logs?${sp.toString()}`);
        const headers = res.headers;
        const pagination = this.parse_headers(headers);

        let json: Object[] = await res.json();
        //Object.assign(json, { "status_code": res.status });
        return [json, pagination];
    }

    async get_log(log_id: string, bPK: string) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);

        const res = await this.fetch(`${this.base_url}/api/log/${log_id}?${sp.toString()}`);

        let json: LogObject = await res.json();
        Object.assign(json, { "status_code": res.status });
        return json;
    }

    async get_contracts(bPK: string, page: number = 1) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);
        sp.set("page", page.toString());

        const res = await this.fetch(`${this.base_url}/api/contracts?${sp.toString()}`);
        const headers = res.headers;
        const pagination = this.parse_headers(headers);

        let json: Object[] = await res.json();
        //Object.assign(json, { "status_code": res.status });
        return [json, pagination];
    }

    async get_pods() {
        const res = await this.fetch(`${this.base_url}/api/pods`);

        let json: Pod[] = await res.json();
        //Object.assign(json, { "status_code": res.status });
        return json;
    }

    async get_assets(bPK: string, page: number = 1) {
        let sp = new URLSearchParams();
        sp.set("bpk", bPK);
        sp.set("page", page.toString());

        const res = await this.fetch(`${this.base_url}/api/assets?${sp.toString()}`);
        const headers = res.headers;
        const pagination = this.parse_headers(headers);

        let json: Object[] = await res.json();
        //Object.assign(json, { "status_code": res.status });
        return [json, pagination];
    }

    async get_object_meta(object_id: string) {
        const res = await this.fetch(`${this.base_url}/object/${object_id}/meta`);

        let json: ObjectMeta;
        try {
            json = await res.json();
        } catch(e: any) {
            throw Error(res.status.toString());
        }
        Object.assign(json, { "status_code": res.status });
        return json;
    }
    
    async read_object(object_id: string) {
        const res = await this.fetch(`${this.base_url}/object/${object_id}/read`);

        let json: any;
        try {
            json = await res.json();
        } catch(e: any) {
            throw Error(res.status.toString());
        }
        Object.assign(json, { "status_code": res.status });
        return json;
    }

    async delete_object(type: string, object_id: string, user_id: string) {
        const body = {
            "type": type,
            "id": object_id,
            "user": user_id
        };

        const res = await this.fetch(`${this.base_url}/api/delete`, {
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

    async delete_log(object_id: string, log_id: string, user_id: string) {
        const body = {
            "id": object_id,
            "log-id": log_id,
            "user": user_id
        };

        const res = await this.fetch(`${this.base_url}/api/log/delete`, {
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

    async submit_da(form_data: any, schema: string, repo: string, user_id: string, object_id?: string) {
        const body = {
            "meta": {
                schema,
                repo,
                "user": user_id,
                "object-id": object_id
            },
            "data": form_data
        };

        const res = await this.fetch(`${this.base_url}/api/da_save`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });

        let json: Object = await res.json();
        Object.assign(json, { "status_code": res.status });
        return json;
    }

    async submit_sa(form_data: any, schema: string, repo: string, user_id: string, object_id?: string) {
        const body = {
            "meta": {
                schema,
                repo,
                "user": user_id,
                "object-id": object_id
            },
            "data": form_data
        };

        const res = await this.fetch(`${this.base_url}/api/sa_save`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });

        let json: Object = await res.json();
        Object.assign(json, { "status_code": res.status });
        return json;
    }

    async get_user(user_id: string, withDid: boolean = false): Promise<User | null> {
        const sp = new URLSearchParams({
            "bPK": user_id,
            "withDid": String(withDid)
        });
        const res = await this.fetch(`${this.base_url}/api/user?${sp.toString()}`);
        if(res.status !== 200) return null;

        const u: User = await res.json();
        return u;
    }

    async create_user(user: User): Promise<boolean> {
        const res = await this.fetch(`${this.base_url}/api/user`, {
            body: JSON.stringify(user),
            method: "POST",
            headers: {
                'content-type': 'application/json'
            }
        });

        return res.status === 200;
    }

    async update_user(user: UpdateUser): Promise<boolean> {
        const res = await this.fetch(`${this.base_url}/api/user`, {
            body: JSON.stringify(user),
            method: "PUT",
            headers: {
                'content-type': 'application/json'
            }
        });

        if(res.status === 500) return false;
        if(res.status === 404) throw Error("user not found!");

        return res.status === 200;
    }

    async delete_user(user_id: string): Promise<boolean> {
        const sp = new URLSearchParams({ "bpk": user_id });

        const res = await this.fetch(`${this.base_url}/api/user?${sp.toString()}`, {
            "method": "DELETE"
        });

        if(res.status === 404) throw Error("user not found");

        return res.status === 200;
    }
    
    async use_backend_datastore(data: string) {
        const res = await this.fetch(`${this.base_url}/api/store_data`, {
            method: "POST",
            body: data,
            headers: {
                'content-type': 'text/plain;charset=UTF-8',
                'accept': 'application/json'
            }
        });
        
        const json: { token: string } = await res.json();
        return json.token;
    }

    async send_email(payload: EmailPayload) {
        const res = await this.fetch(`${this.base_url}/api/mail`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                'content-type': 'application/json',
            }
        });

        return res.status === 200;
    }
}
