"use client";

import { Default, Purple } from "@/components/Buttons";
import Overlay from "@/components/Overlay";
import SOYAForm from "@/components/SOYAForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { saveD2A } from "./actions"; 

export default function D2AOverlay({
    schema,
    onClose,
    open
}: {
    schema: string
    onClose: any
    open: boolean
}) {
    const queryClient = useQueryClient();
    
    let [data, setData] = useState({});

    const mutation = useMutation({
        mutationFn: saveD2A,
        onSuccess: (data: any) => {
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
        <SOYAForm
          setNewDataAction={setData}
          data={data}
          schema={schema}
        />
        <div className="pt-4 flex flex-row">
            <button className={Default + " w-[50%]"} onClick={destroy}>Cancel</button>
            <button className={Purple + " w-[50%]"} onClick={submit}>Submit</button>
        </div>
    </Overlay>;
}
