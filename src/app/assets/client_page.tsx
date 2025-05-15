"use client";

import { useMemo, useState } from "react";
import Loading from "./loading";
import ObjectDrawer, { DrawerState } from "@/components/ObjectDrawer";
import OpenRight from "../svg/OpenRight";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAsset, fetchAssets, fetchPods, saveD2A } from "./actions";
import DropdownTile from "@/components/DropdownTile";
import { Default } from "@/components/Buttons";
import PageIndicator from "@/components/PageIndicator";
import { useRouter, useSearchParams } from "next/navigation";
import D2AOverlay from "./D2AOverlay";
import { ObjectWithMeta, SoyaMetadata } from "@/lib/AdminAPIClient";
import AssetsDrawer from "./AssetsDrawer";


const BUTTON_CLASS = "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-[100%] text-left";


function AssetsRow({
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

export default function AssetsClient() {
    let rtr = useRouter();
    let queryClient = useQueryClient();

    // figure out which page we're on
    const sp = useSearchParams();
    let page = sp.get("page") ?? "1";
    let page_int = parseInt(page, 10);
    if(Number.isNaN(page_int))
        page_int = 1;

    let [drawerState, setDrawerState] = useState<DrawerState>();
    let [D2AData, setD2AData] = useState<SoyaMetadata>();    // contains a schema if we should overlay

    const podsQueryResponse = useQuery({
        queryKey: ["pods"],
        queryFn: fetchPods
    });
    const {
        isPending,
        isError,
        data,
        error 
    } = useQuery({
        queryKey: ["assets", { "page": page_int }],
        queryFn: async () => { return await fetchAssets(page_int); }
    });

    if(podsQueryResponse.isPending || isPending)
        { return <Loading />; }

    if(podsQueryResponse.isError)
        { return <span>Error: {podsQueryResponse.error?.message}</span>; }
    if(isError)
        { return <span>Error: {error?.message}</span>; }


    // util functions for the Page Indicator
    function pagination_prefetch(page_ids: number[]) {
        for(const id of page_ids)
            rtr.prefetch(`/assets?page=${id}`);
    }
    function redirect(page_id: number) {
        queryClient.invalidateQueries({ queryKey: ["assets", { "page": page_int }] });
        rtr.replace(`/assets?page=${page_id}`);
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


    return <div>
        <h1 className="pb-4 text-2xl font-bold">My Assets</h1>

        <D2AOverlay open={!!D2AData} onClose={() => setD2AData(undefined)} metadata={D2AData} />
        <AssetsDrawer drawerState={drawerState} onClose={() => setDrawerState(undefined)} />

        <div className="flex flex-row items-center">
            {/* Pagination */}
            { sharedPageIndicator }

            {/* Add Data Button */}
            <DropdownTile
                buttonContent={<span>Add Data</span>}
                buttonClassName={Default}
            >{(podsQueryResponse.data as any[]).map((el, i) =>
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
                { (data.data as ObjectWithMeta[])  // hehe intellisense :)
                    .map((el, i) => {
                            let onMoreInfoClick = null;
                            if(Object.keys(el).includes("object-id"))
                                onMoreInfoClick = () => setDrawerState({
                                    id: el["object-id"],
                                    name: el.name,
                                    metadata: { "schema": el.schema, "soya-tag": el["soya-tag"] }
                                });

                            return <AssetsRow
                                key={i}
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
