import {BLinkedin} from "./background/linkedin";
import {BGoogle} from "./background/google";
import {BFacebook} from "./background/facebook";

let $linkedin = new BLinkedin();
let $google = new BGoogle();
let $facebook = new BFacebook();


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    $linkedin.handleEvents(message);
    $google.handleEvents(message);
    $facebook.handleEvents(message);
});
