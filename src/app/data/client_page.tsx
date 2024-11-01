"use client";

import PageIndicator from "@/components/PageIndicator";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "./loading";
import OpenRight from "../svg/OpenRight";
import EEGDrawer from "@/app/data/EEGDrawer";
import D2AeegOverlay from "./D2AeegOverlay";
import D3AeegOverlay from "./D3AeegOverlay";
import { Default, Purple } from "@/components/Buttons";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { fetchObjects } from "./requests";


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

    let [soyaData, setSoyaData] = useState<any>(null);           // contains object id, name and schema if drawer is shown
    let [D2Aoverlay, setD2AOverlay] = useState<boolean>(false);  // true if we should overlay
    let [D3AData, setD3AData] = useState<any>(null);             // contains an object id if we should show

    if(isPending)
        { return <Loading />; }

    if(isError)
        { return <span>Error: {error?.message}</span>; }


    function pagination_prefetch(page_ids: number[]) {
        for(const id of page_ids) {
            rtr.prefetch(`/data?page=${id}`);
        }
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

    return <div>
        <h1 className="pb-4 text-2xl font-bold">Data Catalogue</h1>
        
        {/* meta objects, only shown once needed */}
        { D2Aoverlay && (() => <D2AeegOverlay open={D2Aoverlay} onClose={() => setD2AOverlay(false)} />)() /* generate a new instance every time */ }
        { !!D3AData && (() => <D3AeegOverlay open={!!D3AData} onClose={() => setD3AData(null)} object_id={D3AData} />)() /* generate a new instance every time */ }
        <EEGDrawer soyaState={soyaData} onClose={() => setSoyaData(null)} />

        <div className="flex flex-row items-center">
            {/* Pagination */}
            { sharedPageIndicator }
            {/* Add Data Button */}
            <button onClick={() => setD2AOverlay(true)} className={Default}>Add Data</button>
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
                                onAccessClick = () => setD3AData(el["object-id"]);
                                onMoreInfoClick = () => setSoyaData({id: el["object-id"], name: el.name, schema: "D2Aeeg"});  
                            }

                            return <MyDataRow
                                key={i}
                                onAccessClick={onAccessClick}
                                onMoreInfoClick={onMoreInfoClick}
                                name={el.name}
                            />;
                        }
                    )
                }
            </tbody>
        </table>
    </div>;
}

export default function ProvideQueryClientToMyDataClient() {
    return <QueryClientProvider client={queryClient}>
        <MyDataClient />
    </QueryClientProvider>;
}