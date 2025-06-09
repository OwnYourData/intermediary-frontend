"use client";

import { Default, Purple } from "@/components/Buttons";
import Overlay from "@/components/Overlay";
import SOYAForm from "@/components/SOYAForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { generateSignSEARedirect, saveSEA } from "./actions";
import { SoyaMetadata } from "@/lib/AdminAPIClient";
import { redirect } from "next/navigation";

export interface OverlayState {
    "object_id": string;
    "metadata": SoyaMetadata;
}

export default function SEAOverlay({
    onClose,
    state
}: {
    onClose: any,
    state: OverlayState | undefined,
}) {
    const queryClient = useQueryClient();

    let [data, setData] = useState({});
    const mutation = useMutation({
        mutationFn: (variables) => {
            let { data } = variables as any;
            return saveSEA(data, state!!["metadata"]["schema"]);
        },
        onSuccess: (result: any) => {
            queryClient.invalidateQueries({ queryKey: ["services", "logs", "contracts"] });
            generateSignSEARedirect(result["object-id"]).then(url => redirect(url));
        }
    });

    function destroy() {
        setData({});
        onClose();
    }

    function submit() {
        if(Object.keys(data).length === 0) {
            alert("please actually fill something in");
            return;
        }

        mutation.mutate({ data } as any);
        destroy();
    }

    if(!state) return <></>;
    
    return <Overlay open={!!state} onClose={destroy}>
        <h1 className="text-2xl pb-4">Use Data</h1>
        <SOYAForm setNewDataAction={setData as any} data={data} schema={state["metadata"]["schema"]} tag={state["metadata"]["tag"]} formOnly={true} />
        <div className="pt-4 flex flex-row">
            <button className={Default + " w-[50%]"} onClick={destroy}>Cancel</button>
            <button className={Purple + " w-[50%]"} onClick={submit}>Submit</button>
        </div>
    </Overlay>;
}
