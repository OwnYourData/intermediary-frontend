"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export default function QRCodeLoginElement() {
  let [qrCodeContent, setQrCodeContent] = useState("");
  
  useEffect(() => {
    fetch("/api/login?with=wallet")
    .then(async res => {
        let text = await res.text();
        setQrCodeContent(text);
    });

    let itv = setInterval(async () => {
        let res = await fetch("/api/wallet/login-check");
        if(res.status !== 200) return;

        let json = await res.json();
        if("goto" in json) window.location.href = json.goto;
    }, 5 * 1000);

    return () => clearInterval(itv);
  }, []);

  let element = <p className="text-black">Loading ...</p>;

  if(qrCodeContent !== "")
    element = <QRCodeSVG value={qrCodeContent} height={250} width={250} />;

  return <div className="px-4 pb-4 pt-2 bg-slate-800 rounded-sm inline-block text-center">
    <p className="font-bold">Sign in with your Wallet</p>
    <div className="p-2 mt-2 mx-auto bg-white rounded-md w-fit">{element}</div>
  </div>;
}
