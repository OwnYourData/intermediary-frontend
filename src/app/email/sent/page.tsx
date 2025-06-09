import { enforceAuthOnly } from "@/lib/session";
import EmailVerifiedCheck from "./check_for_verified";

export default async function EmailForm() {
    return await enforceAuthOnly() ?? <div className="align-middle">
        <h1 className="text-xl font-bold pb-4">
            Please check your email inbox. There has been an email sent to you.<br />
            If you don&apos;t see it, please also look at your spam folder.<br />
        </h1>
        <EmailVerifiedCheck />
    </div>;
}
