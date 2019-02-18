//main.js

/* Javascript by Catherine McSorley, 2019 */
/* Example from Leaflet Quick Start Guide*/

var mymap = L.map('mapid').setView([0, 0], 0.25);

//add tile layer
var l = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap);

function jQueryAjax(){
    //basic jQuery ajax method
    $.ajax("data/LabData.geojson", {
        dataType: "json",
        success: callback
    });
};

//define callback function
function callback(response, status, jqXHRobject){
    //tasks using the data go here
    console.log(response);
    
    //for each element, add a circle at the lat and long coordinates
    
    for(var i=0; i<20; i++){
        var long = response.features[i].geometry.coordinates[0];
        var lat = response.features[i].geometry.coordinates[1];
        var circle = L.circle([lat, long], {
            //specify outline and fill colors, opacity, radius
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: (response.features[i].properties.y1990)/1.5
        }).addTo(mymap);
}

};

$(document).ready(jQueryAjax);

//a test to make sure everything ran
console.log("Hello");

$(document).ready(initialize);