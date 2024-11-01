import { SessionData } from "@/lib/config/session-config";
import { Container, Html, Section, Text, Link } from "@react-email/components";

export default function VerifyEmail(sessionData: SessionData, href: string) {
    return (
        <Html>
            <Section>
                <Container style={container}>
                    <Text style={heading}>Hello {sessionData.user?.given_name}!</Text>
                    <Text style={paragraph}>Welcome to Intermediary!</Text>
                    <Text style={paragraph}>Please confirm your E-Mail Address by opening the Link below</Text>
                    <Text>Please note that you should open it in the browser where you originally signed up.</Text>
                    <Link href={href}>{href}</Link>
                </Container>
            </Section>
        </Html>
    );
}

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "580px",
};

const heading = {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
};

const paragraph = {
    fontSize: "18px",
    lineHeight: "1.4",
};
