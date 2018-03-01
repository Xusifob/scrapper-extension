// Action on click button
chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({'url': "https://roadoo.malahieude.net"});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type){
        case 'start-scrap' :
            startScrapping(message.options);
            break;

    }
    sendResponse(message);
});