"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultSession, SessionData, sessionOptions } from "./config/session-config";

const LOGIN_PATH = "/api/login";

// get session object
export async function getSession() {
    let session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    let session_keys = Object.keys(session);
    for(const key in defaultSession) {  // loop through every key of the default session
        let s_key = key as keyof SessionData;
        if(!session_keys.includes(s_key))  // if the key is not in the actual session
            Object.assign(session, {s_key: defaultSession[s_key]}); // assign the default
    }

    return session;
}

export async function logout() {  // destroy the session
    const session = await getSession();
    session.destroy();
    redirect('/');
}

export async function login() {  // do a login
    const session = await getSession();
    if(session.is_logged_in && session.is_verified)  // you're already logged in?
        { return; }  // then you have no business here

    return redirect(LOGIN_PATH);
}

// utilities for use in server components, use them like this:
// `return await enforceAuthOnly() ?? <Your Return Component></...>`
// this uses the nullish coercion operator, which does the following:
// `is left side === null? then use right side, else use left side`

// if you need to use them in client components, then create a server component as a wrapper:
// `const ExampleComponentWrapper = () => enforceAuthAndVerify() ?? <ExampleComponent />;`
// then use the wrapper as the component you put in your TSX.

export async function enforceAuthOnly() {  // enforce that user is JUST logged in
    let session = await getSession();

    return (session.is_logged_in === true) && (session.is_verified === false) ? null : redirect(LOGIN_PATH);
}

export async function enforceAuthAndVerify() {  // enforce that the user is logged in
    let session = await getSession();

    return (session.is_logged_in && session.is_verified) ? null : redirect(LOGIN_PATH);
}

export async function enforceNoAuthAndVerify() {  // enforce that the user is logged out
    let session = await getSession();

    return !(session.is_logged_in && session.is_verified) ? null : redirect(LOGIN_PATH);
}