"use server";

import pods, { PodMeta } from "./config/pods";

const PODINFO_PATH = "/version";
const SERVICELIST_PATH = "/list";
const SERVICE_PATH = "/service";

const fetchOptions: Partial<RequestInit> = {
    next: {
        revalidate: 3600,
    }
};


export interface PodInfoResponse {
    service: string;
    version: string;
    "oydid-gem": string;
};

export async function getPodInfo(pod_meta: PodMeta): Promise<PodInfoResponse> {
    let url = `https://${pod_meta.name}.${pod_meta.server}/${PODINFO_PATH}`;

    let res = await fetch(url, { ...fetchOptions });
    let json: PodInfoResponse = await res.json();

    return json;
}

export interface PodService {
    "service-id": number;
    name: string;
}

export async function getPodServices(pod_meta: PodMeta): Promise<PodService[]> {
    let url = `https://${pod_meta.name}.${pod_meta.server}/${SERVICELIST_PATH}`;

    let res = await fetch(url, { ...fetchOptions });
    let json: PodService[] = await res.json();

    return json;
}

export type HTTPMethod =
    "get" | "post" | "put" | "delete" | "options";

export interface Server {
    url: string
}

export interface Parameter {
    name: string,
    in: string,
    required: boolean,
    schema: any
}

export interface PodServiceDetail {
    "service-id": number;
    governance: {
        processing: string[];
        purpose: string[];
        retentionPeriod: string[];
    };
    data: any;
    interface: {
        info: {
            title: string;
            description: string;
        };
        servers: Server[];
        paths: {
            [key: string]: {
                [key in HTTPMethod]: {
                    parameters?: Parameter[];
                    requestBody: {
                        content: {
                            [key: string]: {
                                schema: any;
                            }
                        }
                    }
                }
            }
        }
    };
}

export async function getPodService(pod_meta: PodMeta, service_id: number): Promise<PodServiceDetail> {
    let url = `https://${pod_meta.name}.${pod_meta.server}/${SERVICE_PATH}/${service_id}`;

    let res = await fetch(url, { ...fetchOptions });
    let json: PodServiceDetail = await res.json();

    return json;
}


export interface ServiceBrief {
    pod: string;
    name: string;
    description: string
};

export async function getAllServices(): Promise<ServiceBrief[]> {
    let services: ServiceBrief[] = [];

    for(const meta of pods) {
        let info = await getPodInfo(meta);
        let pod_services = await getPodServices(meta);

        let tmp_services: ServiceBrief[] = [];

        for(const service of pod_services) {
            let service_data = await getPodService(meta, service["service-id"]);
            tmp_services.push({
                "pod": info.service,
                "name": service.name,
                "description": service_data.interface.info.description
            });
        }

        services.push(...tmp_services);
    }

    return services;
}