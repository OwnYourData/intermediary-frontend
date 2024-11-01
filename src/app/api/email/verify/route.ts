import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import crypto from 'crypto';
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/components";
import VerifyEmail from "@/components/VerifyEmail";

const urlencode_email = (email: string) => email.replaceAll('@', '_').replaceAll('.', '-');
const urldecode_email = (email: string) => email.replaceAll('-', '.').replaceAll('_', '@');

// GET handles if user clicks opens E-Mail Token
export async function GET(req: NextRequest) {
    let session = await getSession();
    let sp = req.nextUrl.searchParams;
    let spField = sp.get('token');

    let session_token = session.email_token;
    session.email_token = undefined;
    await session.save();


    // If user is (not) logged in, or if there is no email token in either the session and the search params
    if(
        !session.is_logged_in ||
        !spField ||
        !session_token ||
        (session.is_logged_in && session.is_verified)
    ) { return redirect('/'); }  // redirect user home, they are obviously confused

    let [ email_encoded, token ] = session_token.split("::"); // parse up session token

    if(spField !== token)   // if email token doesn't match
        { return redirect('/email/form'); }  // redirect back to form

    // from here on we know the email is valid

    let email = urldecode_email(email_encoded);  // get email from session

    let bpk = session.user!!.bPK;  // update user with email 
    try {
        await prisma.user.update({
            where: { bPK: bpk },
            data: { email: email }
        });
    } catch(e: any)  // if user doesn't exist we made a mistake earlier -> redirect to /api/login
        { return redirect('/api/login'); }

    // we save is_verified to the session
    session.is_verified = true;
    await session.save();

    // and drop user back off at /api/login
    return redirect("/api/login");
}


// post means user submitted the form at /email/form
export async function POST(req: NextRequest) {
    let session = await getSession();
    let formData = await req.formData();
    let emailField = formData.get("email");

    // if user is (not) logged in, drom them off home
    if(
        !session.is_logged_in ||
        (session.is_logged_in && session.is_verified)
    ) { return redirect('/'); }

    // if emailfield is empty, go back to the form
    if(!emailField)
        { return redirect('/email/form'); }

    let e = urlencode_email(emailField?.toString());  // we encode the email,
    let rand_bytes = crypto.randomBytes(128).toString('hex');   // we generate a looooong token,
    let token = `${e}::${rand_bytes}`; // save it into the session,
    session.email_token = token;
    await session.save();

    // (just here to make development more easy)
    let origin = process.env.NODE_ENV === "production" ? "https://dashboard.go-data.at" : "http://127.0.0.1:3000";
    let href = origin + "/api/email/verify?token=" + rand_bytes;

    await sendEmail({  // and send the email.
        to: emailField.toString(),
        subject: "Email Verification for intermediary.at",
        html: render(VerifyEmail(session, href))
    });

    return redirect('/email/sent');  // now we tell the user we sent it
}