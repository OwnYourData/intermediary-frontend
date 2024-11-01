"use client";

import { Default, Purple } from "@/components/Buttons";
import Overlay from "@/components/Overlay";
import SOYAForm from "@/components/SOYAForm";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { postD3A } from "./requests";

const D3A_SCHEMA = "D3Aeeg";

export default function D3AeegOverlay({
    onClose,
    open,
    object_id
}: {
    onClose: any,
    open: boolean,
    object_id: string
}) {
    let [data, setData] = useState({});
    const mutation = useMutation({
        mutationFn: (variables) => {
            let { data, object_id } = variables as any;
            return postD3A(data, object_id);
        },
        onSuccess: (data) => {
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

        mutation.mutate({ data, object_id } as any);
        destroy();
    }
    
    return <Overlay open={open} onClose={onClose}>
        <h1 className="text-2xl pb-4">Access Data</h1>
        <SOYAForm setNewData={setData} schema={D3A_SCHEMA} />
        <div className="pt-4 flex flex-row">
            <button className={Default + " w-[50%]"} onClick={destroy}>Cancel</button>
            <button className={Purple + " w-[50%]"} onClick={submit}>Submit</button>
        </div>
    </Overlay>;
}