class PopUp
{


    public linkedin : any;

    public google : any;


    public facebook : any;


    constructor() {

        this.linkedin = $('#linkedin');
        this.google = $('#google');
        this.facebook = $('#facebook');

        this.eventListener();

    }


    public eventListener() : void
    {
        let $this : PopUp = this;

        $(document).ready(function () {
            $this.sendEvent('pop-up-open');
        });

        $('.download').on('click',function () {
            chrome.tabs.create({ url: 'https://www.linkedin.com/feed/?download=true' });
        });

        $('button').on('click',function () {
            let $is_running : boolean = $(this).closest('.section').attr('running') === 'true';

            $(this).closest('.section').attr('running',PopUp.booleanToString(!$is_running)).toggleClass('running');

            let $index = $(this).closest('.section').attr('id');


            $this.sendEvent('pop-up-' + $index + '-button-click', {'running' : !$is_running})

        });



        chrome.runtime.onMessage.addListener(function (message : any,sender,senderResponse) {

            switch (message.event) {
                case 'pop-up-open' :
                    $this.parseOpenResponse(message.data);
                    break;
            }


            return true;
        });
    }





    public parseOpenResponse(message) : void
    {
        if(message.linkedin) {
            this.linkedin.attr('running','true').addClass('running');
        }
        if(message.google) {
            this.google.attr('running','true').addClass('running');
        }
        if(message.facebook) {
            this.facebook.attr('running','true').addClass('running');
        }

    }


    /**
     *
     * @param {string} $event_name
     * @param {any} $data
     */
    public sendEvent($event_name : string,$data : any = {})
    {
        $data.event = $event_name;
        chrome.runtime.sendMessage({type: $event_name, options: $data},function () {});
    }



    /**
     *
     * @param {boolean} $bool
     * @returns {string}
     */
    public static booleanToString($bool : boolean) : string
    {

        return $bool === true ? 'true' : 'false';

    }


}

let $popup = new PopUp();

