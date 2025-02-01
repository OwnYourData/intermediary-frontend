"use client";

import { useQuery } from "@tanstack/react-query";
import Drawer from "@/components/Drawer";
import SOYAForm from "@/components/SOYAForm";
import { fetchObject } from "./requests";
import Loading from "./loading";

export default function EEGDrawer({
    soyaState,
    onClose
}: {
    soyaState: any
    onClose: any
}) {
    let open = !!soyaState;
    const object_id = soyaState?.id;

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
    
    if(!open) 
        { return <></>; }

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
    </Drawer>;
};
