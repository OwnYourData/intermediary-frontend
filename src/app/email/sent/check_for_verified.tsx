"use client";

import { useEffect } from "react";

export default function EmailVerifiedCheck() {
  useEffect(() => {
    let itv = setInterval(async () => {
        let res = await fetch("/api/email/verified-check");
        if(res.status !== 200) return;

        let json = await res.json();
        if("goto" in json) window.location.href = json.goto;
    }, 5 * 1000);

    return () => clearInterval(itv);
  }, []);

  return <>
      <h1 className="text-lg">Do not close this tab / do not press back!</h1>
      <p>This page will refresh once you verified your E-Mail Address!</p>
  </>;
}
