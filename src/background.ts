import {BLinkedin} from "./background/linkedin";
import {BGoogle} from "./background/google";

var $linkedin = new BLinkedin();
var $google = new BGoogle();


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    $linkedin.handleEvents(message);
    $google.handleEvents(message);
});
