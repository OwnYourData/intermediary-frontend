const receiveMessage = (message) => {
    if(typeof message.data === 'object') return;
    if(message.data === "identity:auth:goahead") {
        window.opener.postMessage('identity:auth:' + window.auth_status, message.origin);
        window.removeEventListener("message", receiveMessage, false);
    }
};

setTimeout(() => window.location.href = "/api/login?from=idaustria", 500);
window.addEventListener("message", receiveMessage, false);
window.opener.postMessage("identity:auth:callback", "*");