"use client";

import OpenUp from "@/app/svg/OpenUp";
import { UserData } from "@/lib/config/session-config";
import { logout } from "@/lib/session";
import { useState } from "react";

export default function UserTile({
    sessionData
}: {
    sessionData: UserData | undefined
}) {
    let [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen || keepOpen);
    let keepOpen = false;

    let hidden = isOpen ? "" : "hidden";
    
    return <div className="relative">
        <button
            className="flex flex-row items-center py-1.5 px-3 rounded-md bg-slate-600 hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 hover:transition-colors duration-100 focus:ring-2 focus:outline-none focus:ring-slate-500"
            onBlur={toggleOpen}
            onClick={toggleOpen}
        >
            <span>{sessionData?.given_name + " " + sessionData?.last_name}</span>
            <OpenUp />
        </button>
        <div id="dropdown" onMouseOver={() => keepOpen = true} onMouseLeave={() => keepOpen = false} className={"z-10 mt-3 m-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-slate-700 absolute" + " " + hidden}>
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li>
                    <button onClick={async () => await logout()} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-[100%] text-left">Sign out</button>
                </li>
            </ul>
        </div>

    </div>;
}
