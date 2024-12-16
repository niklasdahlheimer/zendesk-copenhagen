import "./index.scss";

import "./modal.jquery.js";
import "./meanmenu.jquery.js";
import "./infieldLabel.jquery.js";

$(document).ready(function (){

  $(".fixed-menu").meanmenu({
    onePage: false,
    meanScreenWidth: "684"
  });

})
