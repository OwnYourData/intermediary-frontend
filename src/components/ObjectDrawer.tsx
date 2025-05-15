"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Drawer from "@/components/Drawer";
import SOYAForm from "@/components/SOYAForm";
import { Red } from "@/components/Buttons";
import { fetchObject } from "@/lib/AdminAPIActions";
import { PageType } from "@/lib/config/pages";
import { SoyaMetadata } from "@/lib/AdminAPIClient";


export interface DrawerState {
    name?: string;
    metadata?: SoyaMetadata;
    id: string;
    log_id?: any;
};

export default function ObjectDrawer({
    drawerState,
    onClose,
    extraButtons,
    drawerType,
    fetchAction = fetchObject,
    setNewDataAction = () => {},
    deleteAction
}: {
    drawerState: DrawerState | undefined,
    onClose: any,
    extraButtons?: React.ReactNode
    drawerType: PageType,
    fetchAction?: (object_id: any) => Promise<any>,
    setNewDataAction?: (data: any) => any,
    deleteAction?: (object_id: any, log_id?: any) => Promise<any>
}) {
    let queryClient = useQueryClient();

    let open = !!drawerState;
    const object_id = drawerState?.id;

    const {
        isPending,
        isError,
        data,
        error
    } = useQuery({
        queryKey: [drawerType, object_id],
        queryFn: async () => { return await fetchAction(object_id); },
        enabled: open,
    }); 
    
    const deleteMutation = useMutation({
        mutationFn: (variables) => {
            if(!deleteAction) throw Error("Object not deletable");

            const { object_id, log_id } = variables as any;
            if(drawerType == "logs") return deleteAction(object_id, log_id);
            return deleteAction(object_id);
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: [drawerType] });
            queryClient.invalidateQueries({ queryKey: [drawerType, object_id] });
            queryClient.invalidateQueries({ queryKey: ["logs"] }); // there is probably a new log now
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
        if(drawerState?.metadata?.schema !== undefined)
            content = <SOYAForm schema={drawerState.metadata.schema} tag={drawerState.metadata["soya-tag"]} data={data} setNewDataAction={setNewDataAction} onLoadAction={() => setNewDataAction(data)} />;
        else
            content = <div className="w-full flex-grow flex-shrink overflow-y-auto">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>;
    }

    let shouldShowContent = !isPending && !isError;

    return <Drawer
        open={open}
        onClose={onClose}
    >
        { drawerState?.name && <pre className="text-wrap break-words pb-4 text-lg">{drawerState?.name}</pre> }
        { isPending && <h1>Loading ...</h1> }
        { isError && <span>Error: {error?.message}</span>}
        { shouldShowContent && content }
        <i className="py-2"></i>
        { extraButtons }
        { deleteAction &&
          <button
            className={Red}
            onClick={() => deleteMutation.mutate({ object_id, "log_id": drawerState?.log_id } as any)
          }>Delete</button>
        }
    </Drawer>;
};
