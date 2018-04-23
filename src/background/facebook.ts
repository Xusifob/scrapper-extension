import {Process} from './Process';


/**
 * Handle all scrapping linked to Google
 *
 */
export class BFacebook extends Process
{

    /**
     *
     */
    public options : any;


    /**
     *
     */
    public timeout : any;


    /**
     *
     * @type {number}
     */
    public iterator : number = 0;


    /**
     *
     * @type {any[]}
     */
    public data : any[] = [];


    /**
     *
     * @type {any[]}
     */
    public posts : any[] = [];


    /**
     * @Constructor
     */
    constructor() {

        super();

        this.is_running = false;

    }


    /**
     *
     * Called by the app when it's starting
     *
     * @param message
     */
    public start(message : any) : void
    {

        this.is_running = true;

        this.options = message.options.follower;

        console.log(this.options);

        this.launch();
    }



    /**
     *
     * @private
     */
    protected launch(){

        let $this = this;

        if(!this.is_running) {
            return;
        }

        $this.data = [];

        $this.scrap();


        this.setActiveTab(false,function () {
            $this.timeout =  setTimeout(function(){
                "use strict";
                $this.launch();
            },$this.options._refresh*1000);

        });

    }


    /**
     * Launch scrapping of
     */
    public scrap() : void
    {

        let $this = this;

        let $url = $this.options.urls[$this.iterator];

        console.log('scrap',$url);

        // Reset when you reach the end
        if(!$url){
            this.parseFacebookData();
            return;
        }

        $url = $this.parseUrl($url);

        $this.openTab($url);

    }


    /**
     *
     * Go to the next url
     *
     * @param $data
     */
    public next($data) : void {
        this.iterator++;

        console.log($data);

        this.data = this.data.concat($data.options);

        this.scrap();
    }




    public parseFacebookData() {

        this.posts = [];

        let $_found = false;

        let $this = this;

        for(let $i = 0; $i < $this.data.length; $i++){
            if(this.checkFacebookContent($this.data[$i])){
                $this.sendNotification('A match has been found!','Check the facebook posts, we found a post that may interest you',$this.data[$i]);
                $_found = true;
            }
        }

        if($_found){

            console.log('FOUND',$_found);


            // this.followerService.save(this.options).subscribe(function(){

//          });

        }

    }


    /**
     *
     * @param $data
     */
    public checkFacebookContent($data : any) : boolean
    {

        let $_regex = this.getKeywordRegex();

        if($data.content.match($_regex)){
            return this.facebookContentMatch($data);

        }
        return false;

    }


    /**
     *
     * Called when facebook content matches one of the keywords
     *
     * @param $data
     */
    public facebookContentMatch($data : any) : boolean
    {

        let $new = true;

        if(this.options.alreadyPosted[$data.id]){

            $new = false;

            let $d = this.options.alreadyPosted[$data.id];

            if($d.review){
                return $new;
            }
        }

        this.options.alreadyPosted[$data.id] = {
            review : false,
            date : new Date(),
        };

        $data.content = $data.content.replace(this.getKeywordRegex(),'<span class="highlight">$&</span>');

        this.posts.push($data);

        return $new;
    }


    /**
     *
     * Return the REGEX for keywords
     *
     * @returns {RegExp}
     */
    public getKeywordRegex()
    {
        if(!this.options.keywords){
            this.options.keywords = [];
        }

        var $keys = this.options.keywords.join('|');

        return new RegExp($keys,'gi');

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


    get is_running() : boolean
    {
        return this._is_running;
    }


    /**
     *
     * @param {string} url
     * @returns {string}
     */
    public parseUrl(url : string) : string
    {

        url += url.indexOf('?') == -1 ? '?' : '&';

        url += 'scrapping=true&sorting_setting=RECENT_ACTIVITY';

        return url;

    }


    /**
     *
     * @param $event
     */
    public handleEvents($event : any) : void
    {
        switch ($event.type) {
            case 'pop-up-google-button-click' :
                this.onToggle($event);
                break;
            case 'pop-up-open' :
                this.handlePopUp($event);
                break;
            case 'facebook-start' :
                this.start($event);
                break;
            case 'facebook-load' :
                this.onLoad($event);
                break;
            case 'facebook-stop' :
                this.onStop($event);
                break;
            case 'facebook-next' :
                this.next($event);
                break;

        }


    }


    /**
     *
     * @param $event
     */
    public onStop($event) : void
    {

        this.is_running = false;

        this.isRunning();

    }


    /**
     * Called on load. Send a mesage to the front-end
     *
     */
    public onLoad(message) : void
    {

        this.isRunning();

    }


    /**
     * Launch to the front-end that it's running
     */
    public isRunning() : void
    {

        let $this = this;

        setTimeout(function () {

            console.log('FACEBOOK IS RUNNING',$this._is_running);
            $this.sendMessageToContent('facebook-running',{
                running : $this._is_running,
            });
        },2000);
    }


    /**
     *
     * Handle the pop-up opening
     *
     * @param $event
     */
    public handlePopUp($event : any) : void
    {
        this.sendMessageToPopup('pop-up-open',{'facebook' : this._is_running});
    }




    /**
     *
     * @param $event
     */
    public onToggle($event : any) : void
    {

        this.is_running = $event.options.running;

    }


}