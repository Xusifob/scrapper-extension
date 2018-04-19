import {Process} from './Process';


/**
 * Handle all scrapping linked to LinkedIn
 *
 */
export class BLinkedin extends Process
{


    constructor() {

        super();



        this.is_running = false;

    }




    /**
     *
     * Set that it's running and send the info to the front-end
     *
     * @param {boolean} $running
     */
    set is_running($running : boolean)
    {
        this._is_running = true === $running;

        this.setActiveTab();

        this.isRunning();

    }



    /**
     *
     * @param $event
     */
    public handleEvents($event : any) : void
    {
        switch ($event.type) {
            case 'pop-up-open' :
                this.handlePopUp($event);
                break;
            case 'linkedin-load' : {
                this.onLoad($event);
                break;
            }
            case 'pop-up-linkedin-button-click' :
                this.onToggle($event);
                break;
        }


    }


    /**
     * Called on load. Send a mesage to the front-end
     *
     */
    public onLoad(message) : void
    {

        this.isRunning();


    }



    public isRunning() : void
    {
        let $this = this;

        setTimeout(function () {
            $this.sendMessageToContent('linkedin-running',{'running' : $this._is_running});
        },100);
    }


    /**
     *
     * Handle the pop-up opening
     *
     * @param $event
     */
    public handlePopUp($event : any) : void
    {
        this.sendMessageToPopup('pop-up-open',{'linkedin' : this._is_running});
    }




    /**
     *
     * @param $event
     */
    public onToggle($event : any) : void
    {

        this.is_running = $event.options.running;

    }




    /**
     *
     * Set the ID of the tab to open to avoid opening multiple tabs all the time
     *
     */
    public setActiveTab()
    {

        let $this = this;

        chrome.tabs.query({currentWindow: true, active : true},function(tabArray){
                if(tabArray[0]) {
                    $this._active_tab = tabArray[0].id;
                }
            }
        );

    }



}