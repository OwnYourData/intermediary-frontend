"use client";

import { ReactNode } from "react";
import Close from '@/app/svg/Close';

export default function Overlay({
    open = false,
    onClose,
    children
}: {
    open: boolean,
    onClose: any,
    children: ReactNode
}) {
    if(!open)
        { return <></>; }
    
    return <>
        <div className="justify-center">
            <div className = "flex flex-col rounded-lg p-4 my-8 mx-6 w-[600px] bg-gray-200 dark:bg-gray-800 fixed inset-0 overflow-scroll z-[10000]">
                <button
                    className= "text-white pb-4"
                    onClick={onClose}
                >
                    <Close />
                </button>
                {children}
            </div>
        </div>
        {/* Background to close overlay when clicking everything but the overlay */}
        {open && (
            <div onClick={onClose} className ="fixed inset-0 bg-black opacity-50 z-[1000]" />
        )}
    </>;
}