"use client";

import { Default, Purple } from "@/components/Buttons";
import Overlay from "@/components/Overlay";
import SOYAForm from "@/components/SOYAForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { generateSignD2ARedirect, saveD2A } from "./actions"; 
import { SoyaMetadata } from "@/lib/AdminAPIClient";
import { redirect } from "next/navigation";

export default function D2AOverlay({
    metadata,
    onClose,
    open
}: {
    metadata: SoyaMetadata | undefined,
    onClose: any
    open: boolean,
}) {
    const queryClient = useQueryClient();
    
    let [data, setData] = useState({});

    function destroy() {
        setData({});
        onClose();
    }

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            return await saveD2A(data, metadata!!.schema);
        },
        onSuccess: (_: any) => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            destroy();
        },
    });

    function submit() {
        if(Object.keys(data).length === 0) {
            alert("please actually fill something in");
            return;
        }

        saveMutation.mutate(data);
    }

    async function sign() {
        if(Object.keys(data).length === 0) {
            alert("please actually fill something in");
            return;
        }

        let url = await generateSignD2ARedirect(data, metadata!!.schema);
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        redirect(url);
    }
    
    return <Overlay open={open} onClose={onClose}>
        <h1 className="text-2xl pb-4">Add Data</h1>
        <SOYAForm
          setNewDataAction={setData}
          data={data}
          schema={metadata ? metadata.schema : ""}
          tag={metadata?.["tag"]}
        />
        <div className="pt-4 flex flex-row justify-between">
            <button className={Default + " w-[50%]"} onClick={destroy}>Cancel</button>
            <button className={Purple + " w-[50%] mr-2"} onClick={submit}>Save</button>
            <button className={Purple + " w-[50%]"} onClick={sign}>Sign</button>
        </div>
    </Overlay>;
}
