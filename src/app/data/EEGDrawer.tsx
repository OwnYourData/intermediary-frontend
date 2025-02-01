"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Drawer from "@/components/Drawer";
import SOYAForm from "@/components/SOYAForm";
import { deleteObject, fetchObject } from "./requests";
import Loading from "./loading";
import { deleteContract } from "../contracts/requests";
import { deleteLog } from "../logs/requests";
import { Red } from "@/components/Buttons";

export default function EEGDrawer({
    soyaState,
    onClose
}: {
    soyaState: any
    onClose: any
}) {
    let queryClient = useQueryClient();

    let open = !!soyaState;
    const object_id = soyaState?.id;
    const type = soyaState?.type;

    const {
        isPending,
        isError,
        data,
        error
    } = useQuery({
        queryKey: ["eeg_object_spec", object_id],
        queryFn: async () => { return await fetchObject(object_id); },
        enabled: open
    }); 
    
    const deleteMutation = useMutation({
        mutationFn: (variables) => {
            let { type, object_id, log_id } = variables as any;
            switch (type) {
                case "contract":
                    return deleteContract(object_id);

                case "log":
                    return deleteLog(object_id, log_id);
                
                case "object":
                    return deleteObject(object_id);

                default:
                    return new Promise<void>(res => res());
            }

        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["eeg_objects"] });
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
            queryClient.invalidateQueries({ queryKey: ["logs"] });
            queryClient.invalidateQueries({ queryKey: ["eeg_object_spec", object_id] });
            onClose();

            if(
                data["res"]["result"] !== undefined &&
                data["res"]["result"] === "not deleted"
            ) alert("Deletion Failed");
        },
    });

    if(!open) 
        { return <></>; }

    let button = <button className = {Red} onClick={() => deleteMutation.mutate({ type, object_id, "log_id": soyaState?.log_id } as any)}>Delete</button>;

    let content;
    if(data !== null) {
        if(Object.keys(soyaState).includes('schema') && soyaState.schema !== undefined)
            content = <SOYAForm schema={soyaState.schema} data={data} setNewData={(data) => console.log(data)} />;
        else
            content = <div className="w-full flex-grow overflow-y-auto h-[75vh]">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>;
    }

    let shouldShowContent = !isPending && !isError;

    return <Drawer
        open={open}
        onClose={onClose}
    >
        <pre className="text-wrap break-words pb-4 text-lg">{soyaState.name}</pre>
        { isPending && <Loading />  }
        { isError && <span>Error: {error?.message}</span>}
        { shouldShowContent && content }
        <i className="py-2"></i>
        { button }
    </Drawer>;
};