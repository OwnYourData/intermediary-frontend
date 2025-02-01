import { Default } from "@/components/Buttons";
import FormattedDate from "@/components/FormattedDate";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function UserProfile() {
    async function resetEmail() {
        "use server";

        let session = await getSession();
        session.is_verified = false;
        await prisma.user.update({
            where: { bPK: session.user!!.bPK },
            data: {
                email: null
            }
        });

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
    
    let user = await prisma.user.findUnique({
        where: { bPK: session.user!!.bPK },
        include: { current_did: true }
    });

    if(!user)
        { return redirect("/api/login?next=/user/profile"); }

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
        
        <label className="block text-black dark:text-white text-sm font-extrabold mb-1" htmlFor="wallet">Wallet</label>
        <div id="wallet">
            { !user.current_did &&
                <button
                    className={Default}
                    onClick={linkWallet}
                >Link Wallet</button>
            }
            { !!user.current_did && <>
                <p>Link valid until <FormattedDate date={user.current_did.valid_until} /></p>
            </>}
        </div>

    </div>;
}