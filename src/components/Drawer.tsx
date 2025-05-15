"use client";

import { ReactNode } from "react";
import Close from '@/app/svg/Close';

export function Drawer({
    open = false,
    onClose,
    children
}: {
    open: boolean,
    onClose: any,
    children: ReactNode
}) {
    return <>
        <div
            className = {`p-4 flex flex-col fixed top-0 right-0 min-h-full overflow-auto w-fit max-w-[600px] bg-gray-200 dark:bg-gray-800 transform transition-transform duration-300 z-[10000] ${
                open ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <button
                onClick={onClose}
                className="text-white pb-4"
            ><Close /></button>
            { children }
        </div>
        {/* Overlay to close drawer when clicking everything but the drawer */}
        {open && (
            <div onClick={onClose} className="fixed inset-0 bg-black opacity-50 z-[1000]" />
        )}
    </>;
};

export default Drawer;
