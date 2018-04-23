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
    public pages = 25;


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
    protected max_page;




    constructor() {

        super();

        let $this = this;

        this.max_page = Math.min(50,this.pages);

        this.urls = JSON.parse(localStorage.getItem('xus-profiles_url'));

        if(!this.urls) {
            this.urls = [];
        }

        this.users = JSON.parse(localStorage.getItem('xus-users'));

        if(!this.users) {
            this.users = [];
        }

        if(this.users.length > 99) {
            $('body').append('<div style="position: fixed;bottom: 0;left:0;color:#fff;background-color: red;padding: 15px;border: none;z-index: 999;left: 0;right: 0;width: 100%;display: block;font-size: 14px;text-align: center;">You\'ve visited a lot of profiles, let it cool down to avoid being flagged</div>');
            return;
        }


        if(!this.isLinkedin()) {
            return;
        }

        console.log('Is linkedin passed');


        $(document).ready(function () {
            $this.load();
        });

        this.handleDownload();
        this.handleReset();

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


        if(document.location.href.match(/download=true/)) {
            localStorage.removeItem('xus-users');
            localStorage.removeItem('xus-profiles_url');
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
        this.is_running = false;

        let csv = this.createCSV(this.users);

        let pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        pom.setAttribute('download', 'leads.csv');
        pom.click();

        this.sendMessage('pop-up-linkedin-button-click',{running : this.is_running})

        document.write('Your leads are being extracted');
        //document.write(csv);
    }





    private load() : void
    {
        this.sendMessage('linkedin-load');
    }





    public run() {

        if(!this.is_running) {
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

        console.log('Launch search !');

        $(".results-list").find('li').each(function(){

            let $url = CLinkedin.trim('https://www.linkedin.com' + $(this).find('a').attr('href'));

            if($this.urls.indexOf($url) === -1 && $url && $url.match(/\/in\//i)){
                $this.urls.push($url);
            }

        });

        let $page = document.location.href.match(/page=[0-9]+/), $_page;

        if($page && $page[0]) {
            $_page = parseInt($page[0].replace('page=',''));
        }
        else {
            $_page = 1;
        }


        localStorage.setItem('xus-profiles_url',JSON.stringify(this.urls));

        if($_page > this.max_page || $('.next-text').length == 0 || this.urls.length > 99) {
            $this.next();
        }else{
            $('html, body').animate({scrollTop:99999},1);
            $('.next-text').click();
            setTimeout(function () {
                $this.run();
            },4000)
        }
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
            $user.name = Scrapper.trim($('.pv-top-card-section__name').text());
            $user.company = Scrapper.trim($('.pv-top-card-section__company').text());
            $user.university = Scrapper.trim($('.pv-top-card-section__school').text());
            $user.location = Scrapper.trim($('.pv-top-card-section__location').text());
            $user.position = Scrapper.trim($('.experience-section').find('li:first-child').find('h3').text());
            $user.languages = Scrapper.trim($('.languages').find('.pv-accomplishments-block__summary-list').text());;
            $user.profile = document.location.href;

            let $universities = '';

            $('.education-section').find('.pv-entity__school-name').each(function(){

                $universities += Scrapper.trim($(this).text()) + ', ';
            });

            $user.universities = $universities;


            // Add the user into the group of users
            if($user.name) {
                $this.users.push($user);
                localStorage.setItem('xus-users',JSON.stringify($this.users));
            }

            $this.next();

        },8000);
    }


    /**
     *
     * Go to next profile
     *
     */
    public next() : void
    {

        console.log('Next');


        this.urls = JSON.parse(localStorage.getItem('xus-profiles_url'));
        if(!this.urls){
            this.urls = [];
        }

        let $url = this.urls[0];

        if(!$url) {
            console.log('finish');
            this.finish();
            return;
        }

        let $index = this.urls.indexOf($url);

        if ($index > -1) {
            this.urls.splice($index, 1);
        }


        localStorage.setItem('xus-profiles_url',JSON.stringify(this.urls));



        // Add a timeout in order to reduce the possibility to be flagged
        setTimeout(function () {
            document.location.href = $url;
        },2000);



    }



}