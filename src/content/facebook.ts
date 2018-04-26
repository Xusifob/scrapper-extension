import {ContentProcess} from "./content-process";


/**
 *
 */
export class CFacebook extends ContentProcess
{


    public data : any[] = [];


    constructor() {

        super();

        let $this = this;

        $(document).ready(function () {
            $this.load();
        });

    }



    /**
     * Extract leads
     */
    public finish() : void
    {


    }





    private load() : void
    {
        this.sendMessage('facebook-load');
    }


    /**
     *
     * Return the content of a Facebook Post on desktop version
     *
     * @param $element
     * @returns {any}
     */
    public getContentDesktop($element) : any {

        let data : any = {};


        data.content = $element.find('._5pbx').text();
        data.url = 'https://facebook.com' + $element.find('._5pcq').attr('href');
        data.date = $element.find('._5pcq').text();
        data.user = $element.find('.fwb a').text();
        data.group = $('title').text();
        data.img = $element.find('._38vo img').attr('src');

        let $id = data.url.match(/permalink\/[0-9]+/);

        console.log(data.url);

        if($id && $id[0]){
            data.id = parseInt($id[0].replace('permalink/',''));
        }else {
            console.log(data);
        }

        return data;

    }


    /**
     *
     * Return the content of a Facebook Post on mobile version
     *
     * @param $element
     */
    public getContentMobile($element) {

        let data : any = {};

        data.content = $element.find('._5rgt').text();
        data.url = 'https://facebook.com' + $element.find('._52jc a').attr('href');
        data.date = $element.find('._52jc a abbr').text();
        data.user = $element.find('._52jd strong:first-child a').text();
        data.group = $('title').text();
        data.img = $element.find('i')[0].outerHTML;

        let $id = data.url.match(/id=[0-9]+&/);

        if($id[0]){
            data.id = $id[0].replace(/id=|&/gi,'');
        }

        return data;
    }


    /**
     *
     * Return if the page loaded is facebook
     *
     * @returns {boolean}
     */
    public isFacebook() : boolean
    {
        "use strict";
        return document.location.href.match(/facebook/) !== undefined && document.location.href.match(/scrapping=true/) !== undefined;
    }


    /**
     *
     * @param $data
     */
    public launch($data) : void {

        console.log('launch',$data);

        this.is_running = $data.running;


        if(!this.is_running) {
            return;
        }


        if(!this.isFacebook()) {
            return;
        }


        this.run();

    }



    /**
     *
     * Return if the post scrapped is already inside the $data array
     *
     * @param $all_posts
     * @param $post
     * @returns {boolean}
     */
    public postAlreadyExist($all_posts,$post){
        "use strict";

        let $match = false;

        $all_posts.forEach(function($item){
            if($post.id == $item.id){
                $match = true;
            }
        });

        return $match;

    }




    /**
     * Run the scrapping
     */
    public run() : void {

        "use strict";

        let $this = this;

        let $data = [];

        $('._5jmm').each(function(){

            let $content = $this.getContentDesktop($(this));

            if(!$content.content || !$content.id){
                return;
            }

            if($this.postAlreadyExist($data,$content)){
                return;
            }

            if($data.indexOf($content) == -1){
                $this.data.push($content);
            }
        });


        console.log($this.data);


        this.sendMessage('facebook-next',$this.data);
    }


}