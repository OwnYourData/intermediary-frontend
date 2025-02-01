"use client";

import Overlay from "./Overlay";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeOverlay({
    open = false,
    onClose,
    content
}: {
    open: boolean,
    onClose: any,
    content: any
}) {
    function destroy() {
        onClose();
    }

    return <Overlay open={open} onClose={destroy}>
        <QRCodeSVG value={content} />
    </Overlay>;
}
