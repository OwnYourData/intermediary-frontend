import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from './config/session-config';

export async function sessionMiddleware(req: NextRequest, res: NextResponse) {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    return { req, res, session };
}
