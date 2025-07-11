import { ReactElement } from "react";

export type PageType = "contracts" | "assets" | "logs" | "data" | "services";

export interface PageMeta {
    icon?: ReactElement;
    name: string;
    path: string;
    subpages?: SubPageMeta[];
}
export interface SubPageMeta {
    name: string;
    path: string;
}

const pages: PageMeta[] = [
    {
        name: "My Assets",
        path: "/assets",
    },
    {
        name: "Data Catalogue",
        path: "/data",
    },
    {
        name: "Service Catalogue",
        path: "/services",
    },
    {
        name: "My Contracts",
        path: "/contracts",
    },
    {
        name: "Logs",
        path: "/logs",
    },
];

export default pages;
