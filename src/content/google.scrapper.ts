import {CGoogle} from "./google";

declare var window : any;

export class GoogleScrapper extends CGoogle
{

    public exact : boolean;

    public option_id : string;

    public jobs : any[] = [];

    public excludedJobs : any[];

    public api_url : string;

    public app_url : string;

    public companies : any[] = [];

    public countries : any[] = [];

    public nb_pages : number = 50;

    public iterator : number = 0;

    public useCompanies : boolean = false;

    public linkedin : string = 'https://linkedin.com/in/';

    public users : any[] = [];

    public google : string = 'https://www.google.com';




    /**
     *
     * Add script to the page
     *
     */
    public launch($data) : void
    {

        this.is_running = $data.running;

        if($data && $data.data) {
            for(let prop in $data.data){
                if($data.data.hasOwnProperty(prop)){
                    this[prop] = $data.data[prop];
                }
            }
        }



        // Get iterator from the localstorage
        let $_storage = parseInt(localStorage.getItem('$iterator'));
        if($_storage){
            this.iterator = $_storage;
        }

        /**
         *
         * If we use the companies number as iterator
         *
         * @type {boolean}
         */
        this.useCompanies = this.companies && this.companies.length > 0;

        if(!this.is_running) {
            return;
        }


        this.run();


    }




    /**
     *
     * Run the scrapping
     *
     */
    public run() : void
    {

        if(this.isCaptcha()) {
            this.handleCaptcha();
            return;
        }


        if(!this.isGoogle()) {
            return;
        }



        if(!this.option_id) {
            this.sendMessage('notification',{title : 'Please set data to scrap',body : 'Please login to your account to set the scrapping data'});
            return;
        }



        let $this = this;

        setTimeout(function () {

            if(!window.jQuery){
                $this.run();
                return;
            }

            $this.addButton();
            $this.addJQuery();


            if (!document.location.href.match('search?.+linkedin\.com')) {
                $this.next();
            } else {
                $this.search();
            }
        }, 3000);


    }


    /**
     * Do the search in Google
     */
    public search() : void
    {

        let $this = this;

        // Wait for input to be visible
        let _interval = setInterval(function(){
            if(document.querySelector('input[name="q"]')){
                clearInterval(_interval);
                setTimeout(function(){

                    $this.scrap();

                },Math.random() * 5000 + 1000);
            }

        },1000);
    }


    /**
     * Launch a scrapping !
     */
    protected scrap(){

        console.log('_scrap');

        // List of google results
        let list = document.getElementById('ires');

        let $this = this;


        if(list){
            // Results
            let elems = list.querySelectorAll('.g');

            for (let w = 0 ;w < elems.length;w++){
                let user : any = {};

                let elem : any = elems[w];

                user.full_name = elem.querySelectorAll('h3 a')[0].innerText.replace(/( [-|] .+)$|(\(.+\) sur ? Linkedin)|(\| linkedin)|(\| Profil professionnel - Linkedin)|( chez .+)|(\| Professional Profile - LinkedIn)/i,'');
                user.linkedin = elem.querySelectorAll('h3 a')[0].getAttribute('href');
                user.linkedin_title = elem.querySelectorAll('.slp')[0] ? elem.querySelectorAll('.slp')[0].innerText : '';

                user.company = $this.companies[$this.iterator];

                user = $this.breakPosition(user);

                if(user){
                    $this.users.push(user);
                }

            }
        }
        $this.iterator++;



        if(($this.useCompanies && $this.companies[$this.iterator]) || $this.iterator < $this.nb_pages){

            localStorage.setItem('$iterator',$this.iterator.toString());

            $this.pushTheData();


        }else{
            $this.finish();
        }


    }



    public pushTheData(){

        let $this = this;

        if(!$this.is_running) {
            "use strict";
            setTimeout(function(){
                $this.pushTheData()
            },2000);
            return;
        }

        $this.pushData(function(){
            "use strict";
            console.log('data pushed');

            $this.next();

        },function(){
            // @TODO Handle different cases

            "use strict";
            setTimeout(function(){
                $this.pushTheData()
            },2000);
        })
    }


    public next() : void
    {
        document.location.href = this.google + '/search?q=' + this.buildQuery() + '&scrapping=true';

    }




    /**
     *
     * Break the linkedin
     *
     * @param user
     * @returns {*}
     */
    protected breakPosition(user : any){

        // If there are no position we remove
        if(!user.linkedin_title || user.linkedin_title == ''){
            return false;
        }
        let position = user.linkedin_title.split(/ - /);
        let $this = this;

        user.linkedin_company = position[2];
        user.address = position[0];
        user.position = position[1];

        // If something is empty, we remove it
        if(!user.address || !user.position || !user.linkedin_company){
            return false;
        }

        console.log('first passed');


        user.address = user.address.trim();
        // Remove company name from position
        user.position = user.position.trim().replace(/ (chez|at|@) .+/igm,'');
        user.linkedin_company = user.linkedin_company.trim();


        // If user is not from the countries we are looking for
        let $countries = new RegExp($this.countries.join('|'),'igm');
        if(!user.address.match($countries)){
            return false;
        }

        console.log('second passed');



        if(this.useCompanies){
            /** @TODO  **/
            // If the user does not have any company
            if(!user.company){
                return false;
            }
        }

        if(!user.linkedin_company){
            return false;
        }




        console.log('third passed');



        if(!this.exact){
            // List of all jobs you want to remove
            if(this.excludedJobs && $this.excludedJobs.length){
                let $excludedJobs = new RegExp(this.excludedJobs.join('|'),'ig');
                if(user.position.match($excludedJobs)){
                    return false;
                }
            }


            console.log('passed 4');

            if($this.useCompanies){
                user.same_company = null != (user.company.match(new RegExp(this.escapeRegex(user.linkedin_company),"gim")) || user.linkedin_company.match(new RegExp(this.escapeRegex(user.company),"gim")));
            }else{
                user.same_company = true;
            }

            user.similarity = 1;


            let $position = new RegExp(this.jobs.join('|'),'gim');

            user.correct_job = null != user.position.match($position);

            console.log('passed 5');

            if(!user.same_company){
                user.similarity = this.similarity(user.company,user.linkedin_company);

                if(user.similarity > 0.6){
                    user.same_company = true;
                }

                if(user.similarity < 0.15){
                    return false;
                }

            }
        }else{

            let $jobs = new RegExp(this.jobs.join('|'),'gim');

            if(!user.position.match($jobs)){
                return false;
            }

        }

        return user;
    }











    /**
     *
     * @param success
     * @param error
     */
    public pushData(success,error){

        let $this = this;

        $.ajax({
            url: $this.api_url + 'scrapping/lead/linkedin/push/' + $this.option_id,
            type: 'POST',
            data: JSON.stringify({
                "leads" : $this.users,
            }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            success: success,
            error : error
        });
    }



    /**
     *
     * Build a Lnikedin Google Query
     *
     * @returns {*}
     */
    protected buildQuery()
    {
        let $this = this;

        let query = ' site:'+ $this.linkedin +' (';

        // If companies, add companies
        if($this.useCompanies){
            query += '"' + $this.companies[$this.iterator] + '") AND (';
        }

        // Add jobs to query
        for (let key = 0 ; key < $this.jobs.length;key++ ){
            let value = $this.jobs[key];
            query += '"'+ value +'"';
            if(key != $this.jobs.length-1){
                query += ' OR ';
            }
        }


        query += ') AND ( ';

        // Add countries to query
        for (let key = 0 ; key < $this.countries.length;key++ ){
            let value = $this.countries[key];
            query += '"'+ value +'"';
            if(key != $this.countries.length-1){
                query += ' OR ';
            }
        }


        query += ')';

        query = query.replace(/&/gi,'%26');


        // If we don't use companies, we go over the pages
        if(!$this.useCompanies){
            query += "&start=" + $this.iterator*10;
        }

        return query;

    }




    /**
     *
     * Finish scrapping
     *
     */
    public finish() : void
    {

        localStorage.removeItem('customjs');
        localStorage.removeItem('xus-script');
        localStorage.removeItem('$iterator');

        this.is_running = false;

        this.sendMessage('google-stop');


        document.location.href = this.app_url + '#/leads/list?options=' + this.option_id;

        this.option_id = '';

    }

}