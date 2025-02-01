"use client";

import OpenUp from "@/app/svg/OpenUp";
import { ReactNode, useState } from "react";

export default function DropdownTile({
    buttonContent,
    buttonClassName,
    children
}: {
    buttonContent: ReactNode
    buttonClassName: string
    children: ReactNode
}) {
    let [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen || keepOpen);
    let keepOpen = false;

    let hidden = isOpen ? "" : "hidden";
    
    return <div className="relative" onBlur={() => setIsOpen(false || keepOpen)}>
        <button
            className= {"flex flex-row items-center py-1.5 px-3 rounded-md hover:transition-colors duration-100 focus:ring-2 focus:outline-none focus:ring-slate-500 " + buttonClassName}
            onBlur={toggleOpen}
            onClick={toggleOpen}
        >
            <span>{buttonContent}</span>
            <OpenUp />
        </button>
        <div id="dropdown" onMouseOver={() => keepOpen = true} onMouseLeave={() => keepOpen = false} className={"z-10 mt-3 m-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-slate-700 absolute" + " " + hidden}>
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">{children}</ul>
        </div>

    </div>;
}
