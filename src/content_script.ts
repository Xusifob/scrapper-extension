import {CLinkedin} from './content/linkedin';
import {CGoogle} from "./content/google";
import {GoogleScrapper} from "./content/google.scrapper";
import {CFacebook} from "./content/facebook";


let $linkedin = new CLinkedin();
let $google = new GoogleScrapper();
let $facebook = new CFacebook();

// Set extension is activated
document.getElementsByTagName('body')[0].setAttribute('extension-installed', 'true');

// Pass the data to the background
document.addEventListener("for-ext", function($event : any) {

    console.log('for ext',$event);

    chrome.runtime.sendMessage({type: $event.detail.event, options: $event.detail},function(response){});
});

chrome.runtime.onMessage.addListener(function($data, sender, sendResponse) {

    console.log('event',$data.event);

    switch ($data.event) {
        case 'linkedin-running' :
            $linkedin.launch($data.data);
            break;
        case 'google-running' :
            $google.launch($data.data);
            break;
        case 'facebook-running' :
            $facebook.launch($data.data);
            break;
    }


    if($data.event == 'fb-details') {
        document.dispatchEvent(new CustomEvent('fb-data',{detail : $data }));
    }

    if($data.event == 'is-fb-following'){
        document.dispatchEvent(new CustomEvent('fb-is-following'));
    }
    if($data.event == 'start-script'){
        document.dispatchEvent(new CustomEvent('start-script',{detail : $data }));
    }

    return true;

});