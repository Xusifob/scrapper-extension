import {GoogleScrapper} from "./google.scrapper";
import {ContentProcess} from "./content-process";



export abstract class CGoogle extends ContentProcess
{


    constructor() {

        super();

        let $this = this;

        if(!this.isGoogle() && !this.isCaptcha()) {
            return;
        }



        $(document).ready(function () {
            $this.load();
        });


    }



    public isGoogle() : boolean
    {
        return document.location.href.match(/google/) != undefined && document.location.href.match(/scrapping=true/) != undefined;
    }


    public isCaptcha(){
        "use strict";
        return document.location.href.match(/ipv4\.google/)

    }


    /**
     *
     * Add script to the page
     *
     */
    public launch($data) : void
    {

        this.is_running = $data.running;

        this.run();


    }


    protected load() : void
    {

        this.sendMessage('google-load');
    }






    /**
     * Send a message to the background to solve the captcha
     */
    public handleCaptcha() : void
    {
        this.sendMessage('google-captcha');
    }

}