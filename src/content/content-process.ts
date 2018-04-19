import {Scrapper} from "./scrapper";

export abstract class ContentProcess extends Scrapper
{


    /**
     *
     * @type {boolean}
     */
    public is_running : boolean = false;


    /**
     *
     * @param $event
     * @param $data
     */
    public sendMessage($event,$data : any = {}) {
        $data.event = $event;

        console.log($data);

        document.dispatchEvent(new CustomEvent('for-ext',{detail : $data }));
    }


    /**
     *
     * @param $data
     */
    protected createCSV($data : any[]) : string
    {


        let $this = this;

        let finalVal = '';

        for (let i = 0; i < $data.length; i++) {
            let value = $data[i];

            if(i == 0) {
                Object.keys(value).forEach(function (key, j) {
                    finalVal += $this.createCSVLine(key,j > 0);
                });

                finalVal += '\n';

            }

            Object.keys(value).forEach(function (key,j) {
               finalVal += $this.createCSVLine(value[key],j > 0);
            });

            finalVal += '\n';
        }

        return finalVal;

    }


    protected createCSVLine($string : string,$separator : boolean) : string
    {
        let result = $string.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
            result = '"' + result + '"';

        if ($separator)
            result = ',' + result ;

        return result;
    }


    public launch($run : any) {

        this.is_running = $run.running;

        this.run()

    }


    abstract run() : void;



}