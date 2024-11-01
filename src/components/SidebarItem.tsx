"use client";

import OpenUp from "@/app/svg/OpenUp";
import { PageMeta } from "@/lib/config/pages";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SidebarItem({
    pageMeta,
}: {
    pageMeta: PageMeta,
}) {
    let [isOpen, setOpen] = useState(false);
    let topPath = pageMeta.path;

    useEffect(() => {
        let path = window.location.pathname;
        let windowTopPath = "/" + path.split("/")[1];
        setOpen(windowTopPath === topPath);
    }, [topPath]);

    let hidden = isOpen ? "" : "hidden";
    let hasSubPages = !!pageMeta.subpages && pageMeta.subpages.length > 0;

    return <div className="flex flex-col pb-4">
        <div className="flex flex-row justify-between items-center">
            <Link href={topPath}>
                <div className="float-left">
                    <p>{pageMeta.name}</p>
                </div>
            </Link>
            <div className="float-right">
                { !hasSubPages ? <></> : 
                    <button onClick={() => setOpen(!isOpen)}>{ pageMeta.subpages ? <OpenUp /> : <></> }</button>
                }
            </div>
        </div>
        { !hasSubPages ? <></> : 
            <div className={"pl-4 " + hidden}>
                {
                    pageMeta.subpages!!.map((subPage, idx) =>
                        <div key={idx} className="pt-4">
                            <a href={topPath + subPage.path}>{subPage.name}</a>
                            <br />
                        </div>
                    )
                }
            </div>
        }
    </div>;
}

