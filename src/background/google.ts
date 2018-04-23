import {Process} from './Process';


/**
 * Handle all scrapping linked to Google
 *
 */
export class BGoogle extends Process
{

    public url;


    public options : any;



    constructor() {

        super();

        this.is_running = false;

    }


    /**
     *
     * Set Google URL
     *
     * @param message
     */
    public start(message)
    {
        console.log(message);

        this.url = message.options.user.settings.google_url + '?scrapping=true';

        this.is_running = true;

        let  $this = this;

        $.get(message.options.script).then(function ($data) {
            $this.launch($data);
        });

    }



    /**
     *
     * @param data
     * @private
     */
    protected launch(data){

        let $this = this;

        this.options = data;

        if(this._is_running) {
            this.reloadTab();
        }

        setTimeout(function(){
            $this.is_running = true;
        },3000);

    }


    /**
     * Display the captcha notification
     */
    public captcha() : void
    {
        this.sendNotification('Captcha triggered','Please solve the captcha to continue scrapping.');
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
     * @param $event
     */
    public handleEvents($event : any) : void
    {
        switch ($event.type) {
            case 'pop-up-open' :
                this.handlePopUp($event);
                break;
            case 'pop-up-google-button-click' :
                this.onToggle($event);
                break;
            case 'google-start' :
                this.start($event);
                break;
            case 'google-load' :
                this.onLoad($event);
                break;
            case 'google-stop' :
                this.onStop($event);
                break;
            case 'notification' :
                this.sendNotificationFromEvent($event);
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

        console.log('google is loading');

        this.isRunning();


    }


    /**
     * Launch to the front-end that it's running
     */
    public isRunning() : void
    {

        let $this = this;

        setTimeout(function () {

            $this.sendMessageToContent('google-running',{
                running : $this._is_running,
                data : $this.options
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
        this.sendMessageToPopup('pop-up-open',{'google' : this._is_running});
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