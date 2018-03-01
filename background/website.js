/**
 *
 * @param options
 */
function startScrapping(options){
    "use strict";

    $.get(options.script).then(_launchScrapping);

}


/**
 *
 * @param data
 * @private
 */
function _launchScrapping(data){
    "use strict";

    console.log(data);


    chrome.tabs.create({ url: 'https://google.com'});

    setTimeout(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
        });
    },1000);

}