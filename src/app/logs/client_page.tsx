"use client";

import { useState } from "react";
import Loading from "./loading";
import EEGDrawer from "../data/EEGDrawer";
import OpenRight from "../svg/OpenRight";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { fetchLogs } from "./requests";

const queryClient = new QueryClient();

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

export function LogsClient() {
    let [drawerData, setDrawerData] = useState<any>(null);
    let {
        isPending,
        isError,
        data,
        error 
    } = useQuery({
        queryKey: ["logs"],
        queryFn: fetchLogs
    });

    if(isPending)
        { return <Loading />; }

    if(isError)
        { return <span>Error: {error?.message}</span>; }

    return <div>
        <h1 className="pb-4 text-2xl font-bold">Logs</h1>

        <EEGDrawer soyaState={drawerData} onClose={() => setDrawerData(null)} />

        {/* Content */}
        <table className="table-auto w-full">
            <thead className="border-gray-600 border-b-2">
                <tr>
                    <th className="text-left">Name</th>
                    <th className="text-right w-10">Options</th>
                </tr>
            </thead>
            <tbody>
                { (data as any[])  // hehe intellisense :)
                    .map((el, i) => {
                            let onMoreInfoClick = null;
                            if(Object.keys(el).includes("object-id") && el["display"] !== false)
                                onMoreInfoClick = () => setDrawerData({id: el["object-id"], log_id: el["log-id"], name: el.name, schema: el.schema, type: "log"});

                            return <LogsRow
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

export default function ProvideQueryClientToLogsClient() {
    return <QueryClientProvider client={queryClient}><LogsClient /></QueryClientProvider>;
}