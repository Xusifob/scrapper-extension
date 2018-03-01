function run(){
    "use strict";

    if(!isGoogle()){
        return;
    }

    chrome.extension.onMessage.addListener(function($script, sender, sendResponse) {

        localStorage.setItem('xus-script',JSON.stringify($script));

        addScriptToPage($script);

    });


    var $script = localStorage.getItem('xus-script');

    if($script){
        $script = JSON.parse($script);

        addScriptToPage($script);
    }


}


run();


/**
 *
 * @param $script
 */
function addScriptToPage($script){
    "use strict";
    var script = document.createElement("script");
    script.textContent = $script;
    document.head.appendChild(script);
}

/**
 *
 * @returns {RegExpMatchArray|Array|{index: number, input: string}}
 */
function isGoogle(){
    "use strict";
    return document.location.href.match(/google/);
}