"use client";

import PageIndicator from "@/components/PageIndicator";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "./loading";
import OpenRight from "../svg/OpenRight";
import EEGDrawer from "@/app/data/EEGDrawer";
import D2AOverlay from "./D2AOverlay";
import D3AOverlay from "./D3AOverlay";
import { Default, Purple } from "@/components/Buttons";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { fetchObjects, fetchServices } from "./requests";
import DropdownTile from "@/components/DropdownTile";


let queryClient = new QueryClient({});


function MyDataRow({
    name,
    onMoreInfoClick,
    onAccessClick
}: {
    name: string,
    onMoreInfoClick?: any
    onAccessClick?: any
}) {
    return <tr className="space-x-4 pb-2 border-gray-600 border-b-2 my-10 align-middle">
        <td className="pr-6 py-2 whitespace-nowrap">{ name }</td>
        <td className="pr-1 py-2 whitespace-normal align-middle text-right flex flex-row">
            { onAccessClick && <button onClick={onAccessClick} className={Purple + " text-center mr-4"}>Access</button> }
            { onMoreInfoClick && <button onClick={onMoreInfoClick}><OpenRight /></button> }
        </td>
    </tr>;
}

export function MyDataClient() {
    let rtr = useRouter();

    const BUTTON_CLASS = "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-[100%] text-left";

    const servicesQueryResponse = useQuery({
        queryKey: ["services"],
        queryFn: async () => { return await fetchServices(); }
    });

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
        queryKey: ["eeg_objects", { "page": page_int }],
        queryFn: async () => { return await fetchObjects(page_int); }
    });

    let [soyaData, setSoyaData] = useState<any>(null);  // contains object id, name and schema if drawer is shown
    let [D2AData, setD2AData] = useState<any>(null);    // a schema if we should overlay
    let [D3AData, setD3AData] = useState<any>(null);    // contains an object id and schema if we should show

    if(isPending || servicesQueryResponse.isPending)  // if there's a pending query we can show Loading
        { return <Loading />; }

    if(isError || servicesQueryResponse.isError)  // if there's an error we show it
        { return <span>Error: {error?.message}</span>; }

    // util functions for the Page Indicator
    function pagination_prefetch(page_ids: number[]) {
        for(const id of page_ids)
            rtr.prefetch(`/data?page=${id}`);
    }
    function redirect(page_id: number) {
        queryClient.invalidateQueries({ queryKey: ["eeg_objects", { "page": page_int }] });
        rtr.replace(`/data?page=${page_id}`);
    }

    let sharedPageIndicator = <></>;
    if(data.pagination) {
        sharedPageIndicator = <PageIndicator
            prefetch={(page_ids: number[]) => pagination_prefetch(page_ids)}
            redirect={redirect}
            first={data.pagination.relative_pages.first}
            curr={data.pagination.curr}
            last={data.pagination.relative_pages.last}
            prev={!!data.pagination.relative_pages.prev ? data.pagination.relative_pages.prev : null}
            next={!!data.pagination.relative_pages.next ? data.pagination.relative_pages.next : null}
        />;
    }

    return <div className={!!soyaData ? "overflow-hidden" : "overflow-auto"}>
        <h1 className="pb-4 text-2xl font-bold">Data Catalogue</h1>
        
        {/* meta objects, only shown once needed */}
        <D2AOverlay open={!!D2AData} onClose={() => setD2AData(null)} schema={D2AData} />
        <D3AOverlay open={!!D3AData} onClose={() => setD3AData(null)} object_data={D3AData} />
        <EEGDrawer soyaState={soyaData} onClose={() => setSoyaData(null)} />

        <div className="flex flex-row items-center">
            {/* Pagination */}
            { sharedPageIndicator }
            {/* Add Data Button */}
            <DropdownTile
                buttonContent={<span>Add Data</span>}
                buttonClassName={Default}
            >{(servicesQueryResponse.data as any[]).map((el, i) =>
                <button onClick={() => setD2AData(el.d2a)} key={i} className={BUTTON_CLASS}>{el.name}</button>)}
            </DropdownTile>
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
                        let onAccessClick = null;
                        let onMoreInfoClick = null;

                        if(Object.keys(el).includes("object-id")) {
                            // filter d2a == current_schema, so we can
                            // get the correct d3a for the "Access" button
                            let tmp = (servicesQueryResponse.data as any[])
                                .filter(e => e["d2a"] == el["schema"]);

                            let d3a_schema = undefined;
                            if(tmp.length != 0)
                                d3a_schema = tmp[0].d3a;

                            onAccessClick = () => setD3AData({
                                "object_id": el["object-id"],
                                "schema": d3a_schema
                            });
                            onMoreInfoClick = () => setSoyaData({
                                id: el["object-id"],
                                name: el.name,
                                schema: el.schema,
                                type: "object"
                            });  
                        }

                        return <MyDataRow
                            key={i}
                            onAccessClick={onAccessClick}
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
export default function ProvideQueryClientToMyDataClient() {
    return <QueryClientProvider client={queryClient}>
        <MyDataClient />
    </QueryClientProvider>;
}
