import { getSession } from "@/lib/session";
import { Default } from "./Buttons";
import UserTile from "./UserTile";
import Link from "next/link";

export default async function TopBar() {
    let session = await getSession();

    let user_element;
    if(!session.is_logged_in && !session.is_verified) {
        user_element = <a className={Default + " font-bold"} href="/api/login">Sign in</a>;
    } else if(session.is_logged_in && !session.is_verified) {
        user_element = <></>;
    } else {
        user_element = <UserTile sessionData={session.user} />;
    }

    return <div className="flex flex-row justify-between pt-4 pb-4 px-6 text-white bg-[#202537] items-center">
        <div className="float-left">
            <h1 className="font-bold text-xl"><Link href="/">Data Intermediary</Link></h1>
        </div>
        <div className="float-right">
            {/* On large screens we display the user tile and navigation is in the sidebar */}
            <div className="md-hidden">{ user_element }</div>
            {/* On mobile, we have a hamburger menu */}
            {/* todo */}
        </div>
    </div>;
}