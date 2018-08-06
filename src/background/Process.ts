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
     * @param $url
     */
    public sendMessageToContent($event : string, $data : any = {},$url : string = '') : void {

        let $this = this;

        let callback = function (tab_id) {

            if(tab_id == undefined) {
                return;
            }


            chrome.tabs.sendMessage(tab_id, {
                event: $event,
                data: $data,
            }, function (response) {});
        };

        console.log('Send message to url',$url);

        if($url) {
            this.getTabFromUrl(false,$url,callback);
        }else {
            this.setActiveTab(true,null,callback);

        }
    }





    /**
     *
     * Set the active tab. If already exist, do nothing
     *
     *
     * @param {boolean} $doNotOpen
     * @param {string|function} $url
     * @param {string|function} callback
     */
    public setActiveTab($doNotOpen : boolean = false,$url : string|any = null,callback : any = null)
    {

        let $this = this;

        /** backward compatibility **/
        if(typeof $url === 'function') {
            callback = $url;
            $url = null;
            console.error($url);
        }


        if($this._active_tab) {
            chrome.tabs.get($this._active_tab,function (tab) {
                if (!chrome.runtime.lastError) {
                    console.log('Tab already exist',tab);

                    if(typeof callback == 'function') {
                        callback($this._active_tab);
                    }
                    return;
                }else{
                    $this.setNewActiveTab($doNotOpen,$url,callback);
                }
            });
        }else {
            $this.setNewActiveTab($doNotOpen,$url,callback);
        }

    }


    /**
     *
     * Set a new active tab if the current is dead
     *
     * @param {boolean} $doNotOpen
     * @param {string | any} $url
     * @param callback
     */
    public setNewActiveTab($doNotOpen : boolean = false,$url : string|any = null,callback : any = null)
    {

        let $this = this;

        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
                window.tabs.forEach(function(tab){

                    if($url) {
                        console.log('Set active tab for url',$url);
                        if(tab.url == $url) {
                            $this._active_tab = tab.id;
                            if(typeof callback === 'function') {
                                callback(tab.id);
                            }
                        }
                    }else{
                        if(tab.url.match(/scrapping=true/)){
                            $this._active_tab = tab.id;
                            if(typeof callback === 'function') {
                                callback(tab.id);
                            }
                        }
                    }
                });
            });

            if(!$this._active_tab && !$doNotOpen) {
               // $this.openTab('https://google.com/?scrapping=true',callback);
            }else {
                if(typeof callback == 'function') {
                    callback(undefined);
                }
            }

        });
    }



    /**
     *
     * Get a tab from a URL
     *
     * @param $doNotOpen
     * @param $url
     * @param callback
     */
    public getTabFromUrl($doNotOpen : boolean = false,$url : string|any = null,callback : any = null)
    {

        let $this = this;


        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
                window.tabs.forEach(function(tab){

                    if(tab.url == $url) {
                        $this._active_tab = tab.id;
                        if(typeof callback === 'function') {
                            callback(tab.id);
                        }
                    }
                });
            });
        });
    }



    public reloadTab() {
        let $this = this;

        this.setActiveTab(false,null,function () {
            chrome.tabs.reload($this.active_tab);
        })
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
            this.setActiveTab(true,null,callback);
        }

        setTimeout(function(){
            if(!$this._active_tab){
                chrome.tabs.create({ url: $url},function(tab){
                    "use strict";
                    $this._active_tab = tab.id;
                    if('function' === typeof callback){
                        callback(tab.id);
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




    /**
     *
     * Send a notification
     *
     * @param {string} $title
     * @param {string} $message
     * @param {string | number} $url
     */
    public sendNotification($title : string,$message : string,$url : string|number = '') : void
    {
        let opt : any = {
            type : "basic",
            title : $title,
            message : $message,
            iconUrl : '/icon.png',
            requireInteraction : true,
        };


        console.log('notification');
        console.log($url);


        chrome.notifications.create('xus-ext',opt,function ($id) {

            chrome.notifications.onClicked.addListener(function ($_id) {
                console.log($url);

                if($id == $_id && $url) {
                    chrome.notifications.clear($id);
                    if(typeof $url === "string") {
                        chrome.tabs.create({ url: $url});
                    }
                }

            })
        });

    }


    /**
     *
     * Send a notification from a front-end event
     *
     * @param $event
     */
    public sendNotificationFromEvent($event : any) : void
    {
        this.sendNotification($event.options.title,$event.options.body);
    }


}