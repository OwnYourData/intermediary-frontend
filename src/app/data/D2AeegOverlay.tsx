"use client";

import { Default, Purple } from "@/components/Buttons";
import Overlay from "@/components/Overlay";
import SOYAForm from "@/components/SOYAForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { postD2A } from "./requests";

const D2A_SCHEMA = "D2Aeeg";

export default function D2AeegOverlay({
    onClose,
    open
}: {
    onClose: any
    open: boolean
}) {
    const queryClient = useQueryClient();
    
    let [data, setData] = useState({});
    const mutation = useMutation({
        mutationFn: postD2A,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["eeg_objects"] });
            alert(data["res"]["message"]);
        },
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

        mutation.mutate(data);
        destroy();
    }
    
    return <Overlay open={open} onClose={onClose}>
        <h1 className="text-2xl pb-4">Add Data</h1>
        <SOYAForm setNewData={setData} schema={D2A_SCHEMA} />
        <div className="pt-4 flex flex-row">
            <button className={Default + " w-[50%]"} onClick={destroy}>Cancel</button>
            <button className={Purple + " w-[50%]"} onClick={submit}>Submit</button>
        </div>
    </Overlay>;
}