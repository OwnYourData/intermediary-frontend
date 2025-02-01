"use client";

import { UserData } from "@/lib/config/session-config";
import { logout } from "@/lib/session";
import { redirect } from "next/navigation";
import DropdownTile from "@/components/DropdownTile";

export default function UserTile({
    sessionData
}: {
    sessionData: UserData | undefined
}) {
    return <DropdownTile
        buttonContent={<span>{sessionData?.given_name + " " + sessionData?.last_name}</span>}
        buttonClassName="bg-slate-600 hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600"
    >
        <li>
            <button onClick={() => redirect("/user/profile")} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-[100%] text-left">Profile</button>
        </li>
        <li>
            <button onClick={async () => await logout()} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-[100%] text-left">Sign out</button>
        </li>
    </DropdownTile>;
}
