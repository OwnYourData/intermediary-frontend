"use client";

import { Default, Purple } from "@/components/Buttons";
import Overlay from "@/components/Overlay";
import SOYAForm from "@/components/SOYAForm";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { saveD3A } from "./actions";

export default function D3AOverlay({
    onClose,
    open,
    object_data
}: {
    onClose: any,
    open: boolean,
    object_data: any
}) {
    let [data, setData] = useState({});
    const mutation = useMutation({
        mutationFn: (variables) => {
            let { data, object_id } = variables as any;
            return saveD3A(data, object_id);
        },
        onSuccess: (data: any) => {
            alert(data["res"]["message"]);
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

        mutation.mutate({ data, "object_id": object_data["object_id"] } as any);
        destroy();
    }

    if(!object_data) return <></>;
    
    return <Overlay open={open} onClose={destroy}>
        <h1 className="text-2xl pb-4">Access Data</h1>
        <SOYAForm setNewDataAction={setData as any} data={data} schema={object_data["schema"]} tag={object_data["tag"]} formOnly={true} />
        <div className="pt-4 flex flex-row">
            <button className={Default + " w-[50%]"} onClick={destroy}>Cancel</button>
            <button className={Purple + " w-[50%]"} onClick={submit}>Submit</button>
        </div>
    </Overlay>;
}
