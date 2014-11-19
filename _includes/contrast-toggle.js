//set our initial state
(function(){

    //get the preference
    var pref = localStorage["contrast"];
    //was there a stored preference
    if ( pref ) {
        toggleContrast(pref);
    }

})();

function toggleContrast (val) {
    //get the body
    var body = document.body;

    //did we get the body?
    if ( !body )
        return;

    //user toggle
    if ( val != undefined ) {
        val === "day" ? body.classList.add("day") : body.classList.remove("day");
    } else {
        body.classList.toggle("day");
    }

    //store the preference
    body.classList.contains("day")
        ?  localStorage["contrast"] = "day"
        :  localStorage["contrast"] = "night";


}