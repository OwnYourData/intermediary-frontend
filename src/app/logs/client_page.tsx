"use client";

import { useState } from "react";
import Loading from "./loading";
import OpenRight from "../svg/OpenRight";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLog, fetchLog, fetchLogs } from "./actions";
import ObjectDrawer, { DrawerState } from "@/components/ObjectDrawer";
import { useSearchParams, useRouter } from "next/navigation";
import PageIndicator from "@/components/PageIndicator";


function LogsRow({
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

export default function LogsClient() {
    let rtr = useRouter();
    let queryClient = useQueryClient();

    // figure out which page we're on
    const sp = useSearchParams();
    let page = sp.get("page") ?? "1";
    let page_int = parseInt(page, 10);
    if(Number.isNaN(page_int))
        page_int = 1;

    let [drawerState, setDrawerState] = useState<DrawerState>();
    const {
        isPending,
        isError,
        data,
        error 
    } = useQuery({
        queryKey: ["logs", { "page": page_int }],
        queryFn: async () => { return await fetchLogs(page_int); }
    });

    if(isPending)
        { return <Loading />; }

    if(isError)
        { return <span>Error: {error?.message}</span>; }

    // util functions for the Page Indicator
    function pagination_prefetch(page_ids: number[]) {
        for(const id of page_ids)
            rtr.prefetch(`/logs?page=${id}`);
    }
    function redirect(page_id: number) {
        queryClient.invalidateQueries({ queryKey: ["logs", { "page": page_int }] });
        rtr.replace(`/logs?page=${page_id}`);
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
        <h1 className="pb-4 text-2xl font-bold">Logs</h1>

        <ObjectDrawer
          drawerState={drawerState}
          onClose={() => setDrawerState(undefined)}
          fetchAction={fetchLog}
          deleteAction={deleteLog}
          drawerType="logs"
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
                { (data.data as any[])  // hehe intellisense :)
                    .map((el, i) => {
                        let onMoreInfoClick = null;
                        if(Object.keys(el).includes("object-id") && el["display"] !== false)
                            onMoreInfoClick = () => setDrawerState({
                                id: el["object-id"],
                                log_id: el["log-id"],
                                name: el.name,
                                metadata: { "schema": el.schema, "tag": el["tag"] }
                            });

                        return <LogsRow
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
