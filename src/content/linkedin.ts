import {ContentProcess} from "./content-process";


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


        if(!this.isLinkedin()) {
            return;
        }


        $(document).ready(function () {
            $this.load();
        });

        this.handleDownload();

        this.eventListener();

    }


    /**
     *
     * @returns {boolean}
     */
    protected isLinkedin() : boolean
    {
        return document.location.href.match(/linkedin/) != undefined;
    }



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
        let csv = this.createCSV(this.users);

        let pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        pom.setAttribute('download', 'leads.csv');
        pom.click();

        document.write('Your leads are being extracted');
        //document.write(csv);
    }





    private load() : void
    {
        this.sendMessage('linkedin-load');
    }


    private eventListener() : void
    {



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

        if($_page > this.max_page) {

            $this.next();
        }else{
            $('html, body').animate({scrollTop:99999},1);
            $('.next-text').click();
            setTimeout(function () {
                $this.run();
            },2500)
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
            $user.name = CLinkedin.trim($('.pv-top-card-section__name').text());
            $user.company = CLinkedin.trim($('.pv-top-card-section__company').text());
            $user.university = CLinkedin.trim($('.pv-top-card-section__school').text());
            $user.location = CLinkedin.trim($('.pv-top-card-section__location').text());
            $user.position = CLinkedin.trim($('.experience-section').find('li:first-child').find('h3').text());
            $user.languages = CLinkedin.trim($('.languages').find('.pv-accomplishments-block__summary-list').text());;
            $user.profile = document.location.href;

            let $universities = '';

            $('.education-section').find('.pv-entity__school-name').each(function(){

                $universities += CLinkedin.trim($(this).text()) + ', ';
            });

            $user.universities = $universities;


            // Add the user into the group of users
            if($user.name) {
                $this.users.push($user);
                localStorage.setItem('xus-users',JSON.stringify($this.users));
            }

            $this.next();

        },4000);
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
            document.write(JSON.stringify(this.users));
            return;
        }

        let $index = this.urls.indexOf($url);

        if ($index > -1) {
            this.urls.splice($index, 1);
        }


        localStorage.setItem('xus-profiles_url',JSON.stringify(this.urls));


        document.location.href = $url + '?scraping=true';



    }


    static trim($string) {

        return $string.replace(/(\r\n\t|\n|\r\t)/g,'').trim();
    }


}