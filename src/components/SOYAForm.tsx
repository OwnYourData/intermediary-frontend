"use client";

import { useCallback, useEffect, useRef } from "react";

const SOYA_ORIGIN = "https://soya-form.ownyourdata.eu";


export default function SOYAForm({
    schema,
    tag,
    formOnly = true,
    data = null,
    setNewDataAction = (_) => {},
    onLoadAction = () => {}
}: {
    schema: string,
    tag?: string,
    data?: any,
    formOnly?: boolean,
    setNewDataAction?: (data: any) => void,
    onLoadAction?: () => void
}) {
    // we need to access the frame
    let ref = useRef<HTMLIFrameElement>(null);
    let iframeState = useRef<{
      data?: any,
      initialized: boolean
    }>({data, initialized: false});

    let sp = new URLSearchParams();  // prepare url
    sp.set("viewMode", "embedded");
    sp.set("schemaDri", schema);
    formOnly && sp.set("viewMode", "form-only");
    tag && sp.set("tag", tag);

    const initializeState = useCallback(() => {
        console.debug("debug: initializing SOYA Form Data");
        if(iframeState.current.data)
            ref.current?.contentWindow?.postMessage({
                "type": "data",
                "data": iframeState.current.data
            }, SOYA_ORIGIN);
        iframeState.current.initialized = true;
        onLoadAction();
    }, [onLoadAction]);

    useEffect(() => {
        const handleMessage = (e: MessageEvent<any>) => {
            if(e.source !== ref.current?.contentWindow) return;
            
            const { data } = e;
            // once an update arrives we can send initialization data if needed
            // if it matches the scheme it's actually rendered as well
            if(data?.type === "update" && !iframeState.current.initialized) initializeState();
            if(data?.type === "data" && iframeState.current.initialized) setNewDataAction(e.data?.evt.data);

        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [initializeState, setNewDataAction]);

    // render frame
    return <iframe src={`${SOYA_ORIGIN}/?${sp.toString()}`} ref={ref} className="w-full h-full flex-grow rounded-md inset-0 overflow-hidden" />;

}
