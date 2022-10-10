const TITLE_ACTIVATE = "Go via proxy";
const TITLE_DEACTIVATE = "Switch to direct connection";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

/*
Toggle proxy: based on the current title, activate or deactivate proxy.
Update the page action's title and icon to reflect its state.
*/
function toggleProxy(tab) {

    function changeProxyStatus(title) {
        let documentHost = new URL(tab.url).hostname;
        if (title === TITLE_ACTIVATE) {
            browser.pageAction.setIcon({ tabId: tab.id, path: "icons/3d-add-hole-color.svg" });
            browser.pageAction.setTitle({ tabId: tab.id, title: TITLE_DEACTIVATE });
            yosp.hosts.push(documentHost);
        } else {
            browser.pageAction.setIcon({ tabId: tab.id, path: "icons/3d-add-hole-gray.svg" });
            browser.pageAction.setTitle({ tabId: tab.id, title: TITLE_ACTIVATE });
            let hostIndex = yosp.hosts.indexOf(documentHost);
            if (hostIndex >= 0) {
                yosp.hosts.splice(hostIndex, 1);
            }
        }
        browser.storage.local.set({
            yosp
        });
    }

    let gettingTitle = browser.pageAction.getTitle({ tabId: tab.id });
    gettingTitle.then(changeProxyStatus);
}

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
Argument url must be a valid URL string.
*/
function protocolIsApplicable(url) {
    const protocol = (new URL(url)).protocol;
    return APPLICABLE_PROTOCOLS.includes(protocol);
}

/*
Initialize the page action: set icon and title, then show.
Only operates on tabs whose URL's protocol is applicable.
*/
function initializePageAction(tab) {
    if (protocolIsApplicable(tab.url)) {
        if (isHostToProxy(new URL(tab.url).hostname)) {
            browser.pageAction.setIcon({ tabId: tab.id, path: "icons/3d-add-hole-color.svg" });
            browser.pageAction.setTitle({ tabId: tab.id, title: TITLE_DEACTIVATE });
        } else {
            browser.pageAction.setIcon({ tabId: tab.id, path: "icons/3d-add-hole-gray.svg" });
            browser.pageAction.setTitle({ tabId: tab.id, title: TITLE_ACTIVATE });
        }
        browser.pageAction.show(tab.id);
    }
}

/*
When first loaded, initialize the page action for all tabs.
*/
let gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
    for (let tab of tabs) {
        initializePageAction(tab);
    }
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    initializePageAction(tab);
});

/*
Toggle CSS when the page action is clicked.
*/
browser.pageAction.onClicked.addListener(toggleProxy);
