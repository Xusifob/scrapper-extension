// Set extension is activated
document.getElementsByTagName('body')[0].setAttribute('extension-installed', true);

console.log('loaded');


// Pass the data to the background
document.addEventListener("for-ext", function($event) {
    chrome.runtime.sendMessage({type: $event.detail.event, options: $event.detail});
});