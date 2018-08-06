import {Scrapper} from "./scrapper";


/**
 *
 */
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
        $data.url = document.location.href;

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


    /**
     *
     * @param {string} $string
     * @param {boolean} $separator
     * @returns {string}
     */
    protected createCSVLine($string : string,$separator : boolean) : string
    {
        let result = $string.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
            result = '"' + result + '"';

        if ($separator)
            result = ',' + result ;

        return result;
    }


    /**
     *
     * Download a JSON file as a CSV
     *
     * @param $json
     */
    public downloadJsonAsCsv($json : any[]) : void
    {
        let csv = this.createCSV($json);
        this.downloadAsCsv(csv);
    }


    /**
     *
     * Download a string as CSV
     *
     * @param {string} csv
     */
    protected downloadAsCsv(csv : string)
    {
        // Create the document and download it
        let pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        pom.setAttribute('download', 'leads.csv');
        pom.click();
    }



    /**
     * Launch the process
     *
     * @param $run
     */
    public launch($run : any) {

        this.is_running = $run.running;

        this.run()

    }


    /**
     *
     * Set that the script is running and send the data to the background
     *
     *
     * @param {boolean} $running
     */
    public setIsRunning($running : boolean) {
        this.is_running = $running;

        this.sendMessage('pop-up-linkedin-button-click',{running : this.is_running});
    }



    /**
     *
     * Send a notification using background
     *
     * @param {string} $title
     * @param {string} $body
     */
    public sendNotification($title : string,$body : string = '') : void {
        this.sendMessage('notification',{
            'title' : $title,
            'body' : $body
        });
    }





    abstract run() : void;

    /**
     *
     * @param $event
     */
    abstract handleEvents($event : any) : void


}