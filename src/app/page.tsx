import { Default } from "@/components/Buttons";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

import QRCodeLoginElement from "@/components/QRCodeLoginElement";

export default async function Home() {
    const session = await getSession();

    async function idALogin() {
        "use server";
        redirect("/api/login");
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Hallo!</h1>
            { session.is_logged_in ?
                <p className="text-lg">Willkommen, {session.user!!.given_name} {session.user!!.last_name}</p> :
                <>
                    <button onClick={idALogin} className={Default + " mb-8"}>Sign in with ID Austria</button>
                    <br />
                    <QRCodeLoginElement />
                </>
            }
        </div>
    );
}
