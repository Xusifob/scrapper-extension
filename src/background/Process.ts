declare var $id : number;


export abstract class Process
{


    /**
     *
     * The process is running
     *
     * @type {boolean}
     */
    protected _is_running : boolean = false;


    /**
     * The ID of the tab we are working on
     *
     *
     */
    protected _active_tab : number;


    get is_running(): boolean {
        return this._is_running;
    }

    set is_running(value: boolean) {
        this._is_running = value;
    }


    /**
     *
     * @returns {number}
     */
    public get active_tab() : number
    {
        return this._active_tab;
    }




    /**
     *
     * Handle the events
     *
     *
     * @param $event
     */
    abstract handleEvents($event : any) : void


    /**
     *
     * @param message
     */
    abstract onLoad(message : any) : void


    /**
     * Send if the script is running or not
     */
    abstract isRunning() : void


    /**
     *
     * @param {string} $event
     * @param $data
     */
    public sendMessageToPopup($event : string, $data : any = {}) : void {

        chrome.runtime.sendMessage({
            event : $event,
            data : $data,
        }, function(response) {
            console.log('SENT DATA',$data);


        });
    }


    /**
     *
     * @param {string} $event
     * @param $data
     */
    public sendMessageToContent($event : string, $data : any = {}) : void {

        let $this = this;

        console.log('Send EVENT',$event,$data);


        this.setActiveTab(false,function() {

            if(!$this._active_tab) {
                $this.sendMessageToContent($event,$data);
                return;
            }

             console.log('SENDING',$event,$data);

            chrome.tabs.sendMessage($this._active_tab, {
                event: $event,
                data: $data,
            }, function (response) {});

        });
    }





    /**
     *
     * @param {boolean} $doNotOpen
     * @param {function} callback
     */
    public setActiveTab($doNotOpen : boolean = false,callback = null)
    {

        let $this = this;

        console.log('setting active tab');


        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
                window.tabs.forEach(function(tab){
                    if(tab.url.match(/scrapping=true/)){
                        $this._active_tab = tab.id;
                        if(typeof callback === 'function') {
                            callback();
                        }
                    }
                });
            });

            if(!$this._active_tab && !$doNotOpen) {
                $this.openTab('https://google.com/?scrapping=true',callback);
            }

        });

    }


    /**
     *
     * Open a new tab or opens the current tab according to the ID set
     *
     * @param $url
     * @param callback function
     */
    public openTab($url : string,callback = null) {

        let $this = this;

        if(!this._active_tab){
            this.setActiveTab(true,callback);
        }

        setTimeout(function(){
            if(!$this._active_tab){
                chrome.tabs.create({ url: $url},function(tab){
                    "use strict";
                    $this._active_tab = tab.id;
                    if('function' === typeof callback){
                        callback();
                    }
                });
            }else{

                chrome.tabs.update( $this._active_tab, { url: $url },function() {
                    if (chrome.runtime.lastError) {
                        $this._active_tab = null;
                        $this.openTab($url);
                    }
                } );
            }
        },500);
    }



    public sendNotification($title : string,$message : string) : void
    {
        let opt = {
            type : "basic",
            title : $title,
            message : $message,
            iconUrl : '/icon.png'
        };

        let $notification = chrome.notifications.create('xus-ext',opt);

    }


}