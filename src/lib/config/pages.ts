export interface PageMeta {
    icon?: JSX.Element;
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
