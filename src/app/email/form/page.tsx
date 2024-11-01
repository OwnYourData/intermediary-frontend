import { Default } from "@/components/Buttons";
import { enforceAuthOnly, getSession } from "@/lib/session";

export default async function EmailForm() {
    const session = await getSession();

    return await enforceAuthOnly() ?? <div className="items-center">
        <h1 className="text-3xl font-bold pb-4">Please confirm your E-Mail Address.</h1>
        <form action="/api/email/verify" method="POST" className="dark:bg-slate-800 bg-gray-300 shadow-md rounded max-w-fit px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
                <label className="block text-black dark:text-white text-sm font-extrabold mb-1" htmlFor="legal_name">Name</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100" disabled={true} name="legal_name" type="text" value={`${session.user?.given_name} ${session.user?.last_name}`} />
            </div>
            <div className="mb-4">
                <label className="block text-black dark:text-white text-sm font-extrabold mb-1" htmlFor="postcode">Postcode</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100" disabled={true} name="postcode" type="text" value={session.user?.postcode} />
            </div>
            <div className="mb-4">
                <label className="block text-black dark:text-white text-sm font-extrabold mb-1" htmlFor="email">E-Mail Address</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100" required={true} placeholder="max@mustermann.tld" name="email" type="email" />
            </div>
            <input type="submit" value={"Submit"} className={Default} />
        </form>
    </div>;
}