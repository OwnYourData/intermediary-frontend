import { prisma } from "@/lib/db";
import { getSession, logout } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// when in doubt, just redirect the user to `/api/login` and they will be forced to login if they aren't

export async function GET(req: NextRequest) {
    let session = await getSession();
    if(!session.next_url)
        session.next_url = req.nextUrl.searchParams.get("next") ?? '/';
    await session.save();
    
    let nextUrl = session.next_url;

    if(!session.is_logged_in) {  // did you not go through login?
        if(req.nextUrl.searchParams.get("target") === "wallet") {
            // TODO
        } else return redirect("/api/idaustria/init"); 
    }  // then do that first

    // did you go through id austra and don't have a verified email?
    // (this usualy means user just got redirected back from /api/idaustria/callback)
    if(session.is_logged_in && !session.is_verified) {  
        let user = await prisma.user.findUnique({  // let's check if you're in the database
            where: { bPK: session.user!!.bPK }
        });

        // no? then let's create you
        if(!user)
            user = await prisma.user.create({
                data: {
                    bPK: session.user!!.bPK,
                    given_name: session.user!!.given_name,
                    last_name: session.user!!.last_name,
                    postcode: session.user!!.postcode,
                }
            });

        // do you have an email saved?
        if(user.email) {
            session.is_verified = true;  // you're verified
            await session.save();
            return redirect(`/api/login`);  // go through this whole spiel again
        } else  // no? then go verify it!
            { return redirect("/email/form"); }
    }

    if(session.is_logged_in && session.is_verified) { // did you go through id austria and have a verified email?
        session.next_url = undefined;
        await session.save();

        let user = await prisma.user.findUnique({
            where: { bPK: session.user!!.bPK },
            include: { current_did: true }
        });

        // expire DID if its become invalid
        if(user!!.current_did) {
            let now = Date.now();
            let expire = Math.floor(user!!.current_did.valid_until.getTime() / 1000);
            if(expire - now < 0)
                await prisma.walletDID.delete({ where: { did: user!!.current_did.did } });
        }

        return redirect(nextUrl);
    }  // then goodbye, you have no business here anymore


    // if an user somehow manages to end up here, someone fucked something very up
    // -> `session.is_logged_in` is `false`, but `session.is_verified` is `true`
    // just log the user out, let them try again
    await logout();  // destroys the session and generates a new one on the next request
    return redirect("/api/login");
}
