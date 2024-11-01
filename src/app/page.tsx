import { getSession } from "@/lib/session";

export default async function Home() {
    const session = await getSession();

    return (
        <div>
            <h1 className="text-4xl font-bold">Hallo!</h1>
            { session.is_logged_in ?
                <p className="text-lg">Willkommen, {session.user!!.given_name} {session.user!!.last_name}</p> :
                <p className="text-lg">Klicke auf &quot;Sign in&quot; um fortzufahren</p>
            }
        </div>
    );
}
