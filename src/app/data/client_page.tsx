"use client";

import PageIndicator from "@/components/PageIndicator";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "./loading";
import OpenRight from "../svg/OpenRight";
import ObjectDrawer, { DrawerState } from "@/components/ObjectDrawer";
import D3AOverlay from "./D3AOverlay";
import { Purple } from "@/components/Buttons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteEntry, fetchEntries } from "./actions";


function DataCatalogueRow({
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

export default function DataCatalogueClient() {
    let rtr = useRouter();
    let queryClient = useQueryClient();

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
        queryKey: ["data", { "page": page_int }],
        queryFn: async () => { console.log("refetching"); return await fetchEntries(page_int); }
    });

    let [drawerState, setDrawerState] = useState<DrawerState>();  // contains object id, name and soyaData if drawer is shown
    let [D3AData, setD3AData] = useState<any>(null);    // contains an object id and soyaData if we should show

    if(isPending)  // if there's a pending query we can show Loading
        { return <Loading />; }

    if(isError)  // if there's an error we show it
        { return <span>Error: {error?.message}</span>; }

    // util functions for the Page Indicator
    function pagination_prefetch(page_ids: number[]) {
        for(const id of page_ids)
            rtr.prefetch(`/data?page=${id}`);
    }
    function redirect(page_id: number) {
        queryClient.invalidateQueries({ queryKey: ["data", { "page": page_int }] });
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
            prev={!!data.pagination.relative_pages.prev ? data.pagination.relative_pages.prev : undefined}
            next={!!data.pagination.relative_pages.next ? data.pagination.relative_pages.next : undefined}
        />;
    }

    return <div className={!!drawerState ? "overflow-hidden" : "overflow-auto"}>
        <h1 className="pb-4 text-2xl font-bold">Data Catalogue</h1>
        
        {/* meta objects, only shown once needed */}
        <D3AOverlay open={!!D3AData} onClose={() => setD3AData(null)} object_data={D3AData} />
        <ObjectDrawer
          drawerState={drawerState}
          onClose={() => setDrawerState(undefined)}
          deleteAction={deleteEntry}
          drawerType="data"
        />

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
                { data.data  // hehe intellisense :)
                    .map(async (el, i) => {
                        console.log(el);
                        let onAccessClick = null;
                        let onMoreInfoClick = null;

                        if(el.d3a) {
                            onAccessClick = () => setD3AData({
                                "object_id": el["object-id"],
                                "schema": el.d3a
                            });
                        }
                        if(el.d2a) {
                            onMoreInfoClick = () => setDrawerState({
                                id: el["object-id"]!!,
                                name: el.name,
                                metadata: el.d2a
                            });

                        }

                        return <DataCatalogueRow
                            key={i}
                            onAccessClick={onAccessClick}
                            onMoreInfoClick={onMoreInfoClick}
                            name={el.name!!}
                        />;
                    })
                }
            </tbody>
        </table>
    </div>;
}
