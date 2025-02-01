import { SessionOptions } from "iron-session";

// configuration for session
export const sessionOptions: SessionOptions = {
    cookieName: "intermediary-session",
    password: process.env.JWT_SECRET!!,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 60 * 24
    }
};

// just some data types
export interface UserData {
    bPK: string,
    last_name: string,
    given_name: string,
    postcode: string,
}

export interface SessionData {
    user?: UserData;
    is_logged_in: boolean;
    is_verified: boolean;
    state_token?: string;
    email_token?: string;
    next_url?: string;
}

// default values for sessions
export const defaultSession: SessionData = {
    is_logged_in: false,
    is_verified: false,
};
