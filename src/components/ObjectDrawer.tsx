"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Drawer from "@/components/Drawer";
import SOYAForm from "@/components/SOYAForm";
import { Red } from "@/components/Buttons";
import { fetchObject } from "@/lib/AdminAPIActions";

export type DrawerType = "contract" | "asset" | "log" | "data" | "service";

export default function ObjectDrawer({
    soyaState,
    onClose,
    drawerType,
    fetchAction = fetchObject,
    deleteAction
}: {
    soyaState: any,
    onClose: any,
    drawerType: DrawerType,
    fetchAction?: (object_id: number) => any,
    deleteAction?: (object_id: number, log_id?: string) => any
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
        queryFn: async () => { return await fetchAction(object_id); },
        enabled: open
    }); 
    
    const deleteMutation = useMutation({
        mutationFn: (variables) => {
            if(!deleteAction) throw Error("Object not deletable");

            let { object_id, log_id } = variables as any;
            if(drawerType == "log") return deleteAction(object_id, log_id);
            return deleteAction(object_id);
        },
        onSuccess: (data: any) => {
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

    let content;
    if(data !== null) {
        if(Object.keys(soyaState).includes('schema') && soyaState.schema !== undefined)
            content = <SOYAForm schema={soyaState.schema} data={data} setNewDataAction={(data) => console.log(data)} />;
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
        { isPending && <h1>Loading ...</h1> }
        { isError && <span>Error: {error?.message}</span>}
        { shouldShowContent && content }
        <i className="py-2"></i>
        { deleteAction &&
          <button
            className={Red}
            onClick={() => deleteMutation.mutate({ type, object_id, "log_id": soyaState?.log_id } as any)
          }>Delete</button>
        }
    </Drawer>;
};
