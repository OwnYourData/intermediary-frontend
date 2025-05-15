import pages from "@/lib/config/pages";
import { SidebarItem } from "./SidebarItem";
import { getSession } from "@/lib/session";

export default async function SideBar() {
    let session = await getSession();

    if(!(session.is_logged_in && session.is_verified))
        { return undefined; }

    return <div className="md:hidden block bg-gray-300 overflow-y-auto px-6 py-8 w-56 dark:bg-[#273449] flex-shrink-0 h-[90vh]">
        <div className="relative left-0 w-[100%]">
            { pages.map((pageMeta, idx) => <SidebarItem pageMeta={pageMeta} key={idx}/>) }
        </div>
    </div>;
}
