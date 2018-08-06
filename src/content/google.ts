import {ContentProcess} from "./content-process";


/**
 * Class made to handle all google Content process
 *
 */
export abstract class CGoogle extends ContentProcess
{



    constructor() {

        super();

        let $this = this;

        if(!this.isGoogle()) {
            return;
        }



        $(document).ready(function () {
            $this.load();
        });


    }

    public handleEvents($event : any)
    {
        switch ($event.event) {
            case 'google-running' :
                this.launch($event.data);
                break;
        }
    }



    /**
     *
     * Return if the page is google
     *
     * @returns {boolean}
     */
    public isGoogle() : boolean
    {
        return this.isCaptcha() || (document.location.href.match(/google/) != undefined && document.location.href.match(/scrapping=true/) != undefined);
    }


    /**
     *
     * Return if the page is a captcha
     *
     * @returns {boolean}
     */
    public isCaptcha() : boolean{
        "use strict";
        return document.location.href.match(/ipv4\.google/) != undefined;

    }


    /**
     * Called on page load
     */
    protected load() : void
    {
        this.sendMessage('google-load');
    }






    /**
     * Send a message to the background to solve the captcha
     */
    public handleCaptcha() : void
    {
        this.sendNotification('A captcha has been triggered','please check that the captcha has been trigered');
    }

}