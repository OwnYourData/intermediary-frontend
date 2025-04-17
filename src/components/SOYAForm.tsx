"use client";

import { useRef } from "react";

const BASE_URL = "https://soya-form.ownyourdata.eu/?";


export default function SOYAForm({
    schema,
    data = null,
    setNewDataAction
}: {
    schema: string
    data?: any,
    setNewDataAction: (data: any) => void
}) {
    // we need to access the frame
    let ref = useRef<HTMLIFrameElement>(null);

    let sp = new URLSearchParams();  // prepare url
    sp.set("viewMode", "embedded");
    sp.set("schemaDri", schema);

    let ranOnce = false;
    window.addEventListener('message', (e: MessageEvent<any>) => {
        if(e.source === window)  // we only care about messages from the child
            { return; }

        if(e.data?.type === "update" && !ranOnce) {
            if(data) {
                // once a single update arrives we can send it our data
                // if it matches the scheme it's actually rendered as well
                ref.current?.contentWindow?.postMessage({
                    "type": "data",
                    "data": data
                }, '*');
            }

            ranOnce = true;  // and remember that we already set it
        };

        // if data updates come tell the parents
        if(e.data?.type === "data" && ranOnce) setNewDataAction(e.data?.evt.data);
    });

    // render frame
    return <iframe src={BASE_URL + sp.toString()} ref={ref} className="w-full h-full flex-grow rounded-md inset-0 overflow-hidden" />;
}
