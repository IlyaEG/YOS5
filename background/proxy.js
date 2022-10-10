const DIRECT = { type: "direct" };
// Initialize the proxy settings
var yosp = {
    hosts: [""],
    proxy: {
        type: "socks",
        host: "localhost",
        port: 12345,
        username: "",
        password: "",
        proxyDNS: true
    }
};

// Set the default list on installation.
browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.get(data => {
        let oldyosp = data.yosp;
        if (oldyosp) {
            yosp = oldyosp;
        } else {
            browser.storage.local.set({
                yosp
            });
        }
    });
});

// Get the stored settings
browser.storage.local.get(data => {
    if (data.yosp) {
        yosp = data.yosp;
    } else {
        yosp = {
            hosts: [""],
            proxy: {
                type: "socks",
                host: "localhost",
                port: 12345,
                username: "",
                password: "",
                proxyDNS: true
            }
        };
    }
});

// Listen for changes in the proxy settings
browser.storage.onChanged.addListener(changeData => {
    yosp = changeData.yosp.newValue;
});

// Managed the proxy

// Listen for a request to open a webpage
browser.proxy.onRequest.addListener(handleProxyRequest, {
    urls: ["<all_urls>"]
});

// On the request to open a webpage
function handleProxyRequest(requestInfo) {
    // Read the web address of the page to be visited
    let documentHost;
    if (requestInfo.type == "main_frame") {
        documentHost = new URL(requestInfo.url).hostname;
    } else if (requestInfo.documentUrl) {
        documentHost = new URL(requestInfo.documentUrl).hostname;
    } else {
        return DIRECT;
    }
    // Determine whether the domain in the web address is on the proxied hosts list
    if (isHostToProxy(documentHost)) {
        // return the proxy configuration
        return yosp.proxy;
    }
    // Return instructions to open the requested webpage
    return DIRECT;
}

function isHostToProxy(documentHost) {
    return yosp.hosts.filter(host => host.length && documentHost.endsWith(host)).length > 0;
}

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
    console.error(`Proxy error: ${error.message}`);
});
