declare var $,jQuery : any;


export abstract class Scrapper
{


    public body : any;

    constructor(){

    }


    /**
     * Run the script
     */
    abstract run() : void


    /**
     *
     * Insert JQuery in the page
     *
     */
    public addJQuery() : void {
        "use strict";
        // Add Jquery
        let script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-2.0.0.min.js';
        script.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(script);

    }


    /**
     *
     * Add a stop button !
     *
     */
    public addButton() : void {
        "use strict";

        let $this = this;

        $this.body = $('body');


        this.body.append('<button id="stop_button" style="position: fixed;bottom: 0;left:0;color:#fff;background-color: red;padding: 15px;border: none;z-index: 999;left: 0;right: 0;width: 100%;display: block;font-size: 14px;cursor: pointer;">STOP THE PROCESS</button>')

        this.body.on('click', '#stop_button', function () {
            $this.finish();
        });

    }


    /**
     *
     * @param {string} $message
     * @param {string} $color
     */
    public addBanner($message : string,$color : string|boolean = 'red')
    {
        if(typeof $ === 'undefined') {
            return;
        }

        if(typeof $color == 'boolean' && true === $color) {
            $color = '#39B54A';
        }

        if(!this.body) {
            this.body = $('body');
        }

        this.body.find('.scrapper-banner').remove();

        this.body.append('<div id="infos-scrapper" class="scrapper-banner" style="position: fixed;bottom: 0;left:0;color:#fff;background-color: '+ $color +';padding: 15px;border: none;z-index: 999;right: 0;width: 100%;display: block;font-size: 14px;text-align: center;">'+ $message +'</div>');

    }



    /**
     *
     * Escape a Regex
     *
     * @param {string} string
     * @returns {string}
     */
    public escapeRegex(string : string) : string
    {
        if(typeof string !== 'string'){
            return '';
        }

        if(typeof string.replace !== 'function') {
            return '';
        }


        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    }


    abstract finish() : void



    /**
     *
     * Calculate similarity between 2 strings
     *
     * @param s1
     * @param s2
     * @returns {number}
     */
    public similarity(s1, s2) : number {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
    }




    /**
     *
     * Edit distance between 2 strings
     *
     * @param s1
     * @param s2
     * @returns {any|*}
     */
    public editDistance(s1, s2) : number {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = [];
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }


    /**
     *
     * @param {string} $string
     * @returns {string}
     */
    static trim($string : string) : string {

        return $string.replace(/(\r\n\t|\n|\r\t)/g,'').trim();
    }


    /**
     *
     * @returns {string}
     */
    static getTodayDate() : string {
        return new Date().toISOString().slice(0,10);
    }



}