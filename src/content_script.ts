import {CLinkedin} from './content/linkedin';
import {GoogleScrapper} from "./content/google.scrapper";
import {CFacebook} from "./content/facebook";


let $linkedin = new CLinkedin();
// let $google = new GoogleScrapper();
// let $facebook = new CFacebook();


document.getElementsByTagName('body')[0].setAttribute('extension-installed', 'true');


// Pass the data to the background
document.addEventListener("for-ext", function($event : any) {

    chrome.runtime.sendMessage({type: $event.detail.event, options: $event.detail},function(response){});
});

chrome.runtime.onMessage.addListener(function($data, sender, sendResponse) {
    $linkedin.handleEvents($data);
   // $google.handleEvents($data);
   // $facebook.handleEvents($data);


        document.dispatchEvent(new CustomEvent($data.event,{detail : $data.data }));


    return true;

});