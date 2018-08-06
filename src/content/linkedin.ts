import {ContentProcess} from "./content-process";
import {Scrapper} from "./scrapper";


/**
 *
 */
export class CLinkedin extends ContentProcess
{

    /**
     *
     * @type {number}
     */
    public pages = 1000;


    /**
     *
     * @type {any[]}
     */
    public urls = [];


    /**
     *
     * @type {any[]}
     */
    public users = [];


    /**
     * @type number
     */
    protected max_page = 1000;


    /**
     *
     * @type {any[]}
     */
    protected number_scrapped : any = {};


    /**
     *
     * @type {number}
     */
    protected per_day : number = 20;



    constructor() {

        super();

        let $this = this;

        this.urls = JSON.parse(localStorage.getItem('xus-profiles_url-2'));

        if(!this.urls) {
            this.urls = [];
        }

        this.users = JSON.parse(localStorage.getItem('xus-users'));

        if(!this.users) {
            this.users = [];
        }

        this.number_scrapped = JSON.parse(localStorage.getItem('xus-number_scrapped'));

        if(!this.number_scrapped) {
            this.number_scrapped = {};
        }

        console.log(this.number_scrapped);



        if(!this.number_scrapped[Scrapper.getTodayDate()]) {
            this.number_scrapped[Scrapper.getTodayDate()] = 0;
        }

        console.log(this.number_scrapped);


        this.handleDownload();
        this.handleReset();


        if(this.number_scrapped[Scrapper.getTodayDate()] > (this.per_day +1)) {
            $this.addBanner("You've visited a lot of profiles today, let it cool down to avoid being flagged");
            $this.setIsRunning(false);
            return;
        }


        if(!this.isLinkedin()) {
            return;
        }

        console.log('Is linkedin passed');

        $(document).ready(function () {
            $this.load();
        });



    }


    /**
     *
     * @returns {boolean}
     */
    protected isLinkedin() : boolean
    {
        return document.location.href.match(/linkedin/) != undefined;
    }


    /**
     * Handle reset of all linkedIn data
     */
    private handleReset() : void {


        if(document.location.href.match(/reset=true/)) {
            localStorage.removeItem('xus-users');
            localStorage.removeItem('xus-profiles_url-2');
            document.write('Your data has been reseted');
        }
    }


    /**
     * Handle download of all linkedIn data
     */
    private handleDownload() : void {


        if(document.location.href.match(/download=true/)) {

            this.finish();

        }
    }


    /**
     * Extract leads
     */
    public finish() : void
    {

        this.downloadJsonAsCsv(this.urls);

        // Send to background that it's not running anymore
        this.setIsRunning(false);

        // Display it
        document.write('Your leads are being extracted');

        // Send notification
        this.sendNotification('Linkedin scrapping done!','Your leads are being extracted');
    }





    private load() : void
    {
        this.sendMessage('linkedin-load');
    }


    /**
     *
     * @param $event
     */
    public handleEvents($event : any)
    {
        switch ($event.event) {
            case 'linkedin-running' :
                this.launch($event.data);
                break;
        }
    }


    public run() {

        if(!this.is_running) {
            return;
        }

        if(!this.isLinkedin()) {
            return;
        }


        if(document.location.href.match(/\/in\//)) {
            this.profile();
        }else if(document.location.href.match(/\/search\//)) {
            this.search();
        }
    }


    /**
     * Scrap the search page
     */
    public search() {

        let $this = this;


        $(".results-list").find('li').each(function(){

            let $url = CLinkedin.trim('https://www.linkedin.com' + $(this).find('a').attr('href'));

            let $name = CLinkedin.trim($(this).find('.name').text());
            let $title = CLinkedin.trim($(this).find('.subline-level-1').text());

            let user = {
                name : $name,
                title : $title,
                url : $url,
            };

            if($this.urls.indexOf(user) === -1 && $url && $url.match(/\/in\//i)){
                $this.urls.push(user);
            }

        });

        let $page = document.location.href.match(/page=[0-9]+/), $_page;

        if($page && $page[0]) {
            $_page = parseInt($page[0].replace('page=',''));
        }
        else {
            $_page = 1;
        }


        localStorage.setItem('xus-profiles_url-2',JSON.stringify(this.urls));

        $this.addBanner('The scrapper is running. '+ this.urls.length +' profiles scrapped. <a target="_blank" href="https://www.linkedin.com/feed/?download=true">Download</a>',true);

        $('html, body').animate({scrollTop:99999},1);

        setTimeout(function () {
            if($_page > $this.max_page || $('.next-text').length == 0 || $this.urls.length > 999) {
                $this.next();
            }else{
                $('.next-text').click();
                setTimeout(function () {
                    $this.run();
                },4000)
            }
        },1000);


    }



    /**
     *
     * Scrap a profile page
     *
     */
    public profile() {
        let $user : any = {};
        let $this : CLinkedin = this;

        // Scroll the whole page
        $('html, body').animate({scrollTop:99999},1);

        setTimeout(function () {


            $('html, body').animate({scrollTop:0},1);


            $user.fullName = Scrapper.trim($('.pv-top-card-section__name').text());
            $user.company = Scrapper.trim($('.pv-top-card-v2-section__company-name').text());
            $user.university = Scrapper.trim($('.pv-top-card-v2-section__school-name').text());
            $user.location = Scrapper.trim($('.pv-top-card-section__location').text());
            $user.position = Scrapper.trim($('body').find('.experience-section').find('li:first-child').find('h3').text());
            $user.languages = Scrapper.trim($('.languages').find('.pv-accomplishments-block__summary-list').text());;
            $user.profile = document.location.href;
            $user.scrapping_date = new Date().toISOString();

            let $universities = '';

            $('.education-section').find('.pv-entity__school-name').each(function(){

                $universities += Scrapper.trim($(this).text()) + ', ';
            });

            $user.universities = $universities;


            // Add the user into the group of users
            if($user.fullName) {
                $this.users.push($user);
                localStorage.setItem('xus-users',JSON.stringify($this.users));
            }
            setTimeout(function () {
                $('body').find('#infos-scrapper').append('<style>pre{text-align: left; color: #000; background: #fff;padding: 1rem; margin: 1rem -15px 0; border: solid #f7f7f9; border-width: .2rem 0 0;}</style><pre>'+ JSON.stringify($user,null,2) +'</pre>');
                $this.next();
            },3000);

        },7000);

        $this.addBanner('The scrapper is running. '+ $this.users.length +' users scrapped. '+ $this.urls.length +' profiles left',true);

    }


    /**
     *
     * Go to next profile
     *
     */
    public next() : void
    {

        this.urls = JSON.parse(localStorage.getItem('xus-profiles_url-2'));
        if(!this.urls){
            this.urls = [];
        }


        this.number_scrapped[Scrapper.getTodayDate()]++;
        console.log(this.number_scrapped);


        let $url = this.urls[0];

        if(!$url || this.number_scrapped[Scrapper.getTodayDate()] >= (this.per_day -1)) {
            console.log('finish');
            this.finish();
            return;
        }

        let $index = this.urls.indexOf($url);

        if ($index > -1) {
            this.urls.splice($index, 1);
        }



        console.log(this.number_scrapped);
        console.log(JSON.stringify(this.number_scrapped));

        localStorage.setItem('xus-profiles_url-2',JSON.stringify(this.urls));
        localStorage.setItem('xus-number_scrapped',JSON.stringify(this.number_scrapped));



        // Add a timeout in order to reduce the possibility to be flagged
        setTimeout(function () {
            document.location.href = $url;
        },2000);



    }





}