const hostsTextArea = document.querySelector("#proxied-hosts");
const hostInput = document.querySelector("#proxy-host");
const portInput = document.querySelector("#proxy-port");
const userInput = document.querySelector("#proxy-user");
const passwordInput = document.querySelector("#proxy-password");

// Store the currently selected settings using browser.storage.local.
function storeSettings() {
    let yosp = {
        hosts: hostsTextArea.value.split("\n").filter(h => h.length).sort(),
        proxy: {
            type: "socks",
            host: hostInput.value,
            port: portInput.value,
            username: userInput.value,
            password: passwordInput.value,
            proxyDNS: true
        }
    };
    browser.storage.local.set({
        yosp
    });
}

// Update the options UI with the settings values retrieved from storage,
// or the default settings if the stored settings are empty.
function updateUI(restoredSettings) {
    if (restoredSettings.yosp) {
        hostsTextArea.value = restoredSettings.yosp.hosts.filter(h => h.length).sort().join("\n");
        hostInput.value = restoredSettings.yosp.proxy.host;
        portInput.value = restoredSettings.yosp.proxy.port;
        userInput.value = restoredSettings.yosp.proxy.username;
        passwordInput.value = restoredSettings.yosp.proxy.password;
    }
}

function onError(e) {
    console.error(e);
}

// On opening the options page, fetch stored settings and update the UI with them.
browser.storage.local.get().then(updateUI, onError);

// Whenever the contents of the textarea changes, save the new values
hostsTextArea.addEventListener("change", storeSettings);
hostInput.addEventListener("change", storeSettings);
portInput.addEventListener("change", storeSettings);
userInput.addEventListener("change", storeSettings);
passwordInput.addEventListener("change", storeSettings);
