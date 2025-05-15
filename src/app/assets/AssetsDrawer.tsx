import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAsset, generateSignD2ARedirect, saveD2A } from "./actions";
import { redirect } from "next/navigation";
import ObjectDrawer, { DrawerState } from "@/components/ObjectDrawer";
import { useState } from "react";
import { Purple } from "@/components/Buttons";

export default function AssetsDrawer({
    drawerState,
    onClose,
}: {
    drawerState: DrawerState | undefined,
    onClose: any,
}) {
    const [data, setData] = useState<any>(undefined);
    const queryClient = useQueryClient();

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            console.log("saving:", data);
            return await saveD2A(data, drawerState!!.metadata!!.schema, drawerState!!.id);
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            onClose();
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

        let url = await generateSignD2ARedirect(data, drawerState!!.metadata!!.schema, drawerState!!.id);
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        redirect(url);
    }


    return <ObjectDrawer
        drawerState={drawerState}
        onClose={onClose}
        setNewDataAction={setData}
        deleteAction={deleteAsset}
        extraButtons={<div className="flex flex-row align-middle">
            <button className={Purple + " w-[50%] mr-2"} onClick={submit}>Save</button>
            <button className={Purple + " w-[50%]"} onClick={sign}>Sign</button>
        </div>}
        drawerType="assets"
    />;
}
