import "./index.scss";

import "./modal.jquery.js";
import "./infieldLabel.jquery.js";

import "./meanMenu/jquery.meanmenu.js";

$(document).ready(function (){

  // social share popups
  $(".share a").click(function (e) {
    e.preventDefault();
    window.open(this.href, "", "height = 500, width = 500");
  });


  $(".fixed-menu").meanmenu({
    onePage: false,
    meanScreenWidth: "684"
  });

})
