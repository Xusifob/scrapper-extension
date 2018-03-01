$(document).ready(function(){
  "use strict";

  $('#submit').on('click',function(){
    var $url = $('#url').val();
    console.log($url);


    setInterval(function(){
      chrome.tabs.create({ url: $url });

    },5000)

  })

});