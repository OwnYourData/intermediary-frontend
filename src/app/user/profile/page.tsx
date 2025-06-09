import { Default } from "@/components/Buttons";
import FormattedDate from "@/components/FormattedDate";
import { getSession } from "@/lib/session";
import { client } from "@/lib/sharedAdminClient";
import { redirect } from "next/navigation";

export default async function UserProfile() {
    async function resetEmail() {
        "use server";

        let session = await getSession();
        session.is_verified = false;
        let result = await client.update_user({
            bPK: session.user!!.bPK,
            email: null
        });
        console.log(result);
        console.log(await client.get_user(session.user!!.bPK));

        await session.save();

        redirect("/api/login?next=/user/profile");
    }

    async function linkWallet() {
        "use server";
        redirect("/api/wallet/link");
    }

    let session = await getSession();

    if(!(session.is_logged_in && session.is_verified))
        { return redirect("/api/login?next=/user/profile"); }
    
    let user = await client.get_user(session.user!!.bPK, true);

    if(!user)
        { return redirect("/api/login?next=/user/profile"); }

    console.log(user);

    return <div>
        <h1 className="pb-4 text-2xl font-bold">Welcome {session.user!!.given_name} {session.user!!.last_name}</h1>

        <label className="block text-black dark:text-white text-sm font-extrabold mb-1" htmlFor="email">E-Mail Address</label>
        <input
            className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100 mb-2 mr-4"
            disabled={true}
            placeholder="max@mustermann.tld"
            name="email"
            type="email"
            value={user.email!!}
        />
        
        <button
            className={Default}
            onClick={resetEmail}
        >Change E-Mail Address</button>
        
        <label className="block text-black dark:text-white text-sm font-extrabold mb-1" htmlFor="bpk">Area-specific personal identifier</label>
        <input
            className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100 mb-2 mr-4"
            disabled={true}
            placeholder="if you see this shout really loudly"
            name="bPK"
            type="bPK"
            value={user.bPK}
        />

        <label className="block pt-2 text-black dark:text-white text-xl font-extrabold mb-1" htmlFor="wallet">Wallet</label>
        <div id="wallet">
            { !!user.current_did?.did && <>
                <p>Link valid until <FormattedDate date={new Date(Date.parse(user.current_did.valid_until!!))} /></p>
                <label className="block text-black dark:text-white text-sm font-extrabold mb-1" htmlFor="did">Decentralised Identity (DID)</label>
                <input
                    className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100 mb-2 mr-4"
                    disabled={true}
                    placeholder="if you see this shout really loudly"
                    name="did"
                    type="did"
                    value={user.current_did.did}
                />
                <p className={Default + " w-fit inline"}><a href={`https://dev.uniresolver.io/#${user.current_did.did}`}>Show at Uniresolver</a></p>
            </>}
            <br />
            <button
                className={Default}
                onClick={linkWallet}
            >Connect Wallet</button>
        </div>
    </div>;
}
