"use client";

import PageIndicator from "@/components/PageIndicator";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "./loading";
import OpenRight from "../svg/OpenRight";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { fetchEntries } from "./actions";
import ObjectDrawer from "@/components/ObjectDrawer";


let queryClient = new QueryClient({});


function ServicesRow({
    name,
    onMoreInfoClick,
}: {
    name: string,
    onMoreInfoClick?: any
}) {
    return <tr className="space-x-4 pb-2 border-gray-600 border-b-2 my-10 align-middle">
        <td className="pr-6 py-2 whitespace-nowrap">{ name }</td>
        <td className="pr-1 py-2 whitespace-normal align-middle text-right flex flex-row">
            { onMoreInfoClick && <button onClick={onMoreInfoClick}><OpenRight /></button> }
        </td>
    </tr>;
}

export function ServicesClient() {
    let rtr = useRouter();

    /* figure out which page we're on */
    const sp = useSearchParams();
    let page = sp.get("page") ?? "1";
    let page_int = parseInt(page, 10);
    if(Number.isNaN(page_int))
        page_int = 1;

    const {
        isPending,
        isError,
        data,
        error
    } = useQuery({
        queryKey: ["services", { "page": page_int }],
        queryFn: async () => { return await fetchEntries(page_int); }
    });

    let [soyaData, setSoyaData] = useState<any>(null);  // contains object id, name and schema if drawer is shown

    if(isPending)  // if there's a pending query we can show Loading
        { return <Loading />; }

    if(isError)  // if there's an error we show it
        { return <span>Error: {error?.message}</span>; }

    // util functions for the Page Indicator
    function pagination_prefetch(page_ids: number[]) {
        for(const id of page_ids)
            rtr.prefetch(`/services?page=${id}`);
    }
    function redirect(page_id: number) {
        queryClient.invalidateQueries({ queryKey: ["services", { "page": page_int }] });
        rtr.replace(`/services?page=${page_id}`);
    }

    let sharedPageIndicator = <></>;
    if(data.pagination) {
        sharedPageIndicator = <PageIndicator
            prefetch={(page_ids: number[]) => pagination_prefetch(page_ids)}
            redirect={redirect}
            first={data.pagination.relative_pages.first}
            curr={data.pagination.curr}
            last={data.pagination.relative_pages.last}
            prev={!!data.pagination.relative_pages.prev ? data.pagination.relative_pages.prev : undefined}
            next={!!data.pagination.relative_pages.next ? data.pagination.relative_pages.next : undefined}
        />;
    }

    return <div className={!!soyaData ? "overflow-hidden" : "overflow-auto"}>
        <h1 className="pb-4 text-2xl font-bold">Service Catalogue</h1>
        
        {/* meta objects, only shown once needed */}
        <ObjectDrawer soyaState={soyaData} onClose={() => setSoyaData(null)} drawerType="service" />

        <div className="flex flex-row items-center">
            {/* Pagination */}
            { sharedPageIndicator }
        </div>

        {/* Content */}
        <table className="table-auto w-full">
            <thead className="border-gray-600 border-b-2">
                <tr>
                    <th className="text-left">Name</th>
                    <th className="text-right w-10">Options</th>
                </tr>
            </thead>
            <tbody>
                { (data.data as any[])  // hehe intellisense :)
                    .map((el, i) => {
                        let onMoreInfoClick = null;

                        if(Object.keys(el).includes("object-id")) {
                            onMoreInfoClick = () => setSoyaData({
                                id: el["object-id"],
                                name: el.name,
                                schema: el.schema,
                                type: "service"
                            });  
                        }

                        return <ServicesRow
                            key={i}
                            onMoreInfoClick={onMoreInfoClick}
                            name={el.name}
                        />;
                    })
                }
            </tbody>
        </table>
    </div>;
}

// Provide QueryClient to page
export default function ProvideQueryClientToServicesClient() {
    return <QueryClientProvider client={queryClient}>
        <ServicesClient />
    </QueryClientProvider>;
}
