/* Javascript by Catherine McSorley, 2019 */
/* Example from Leaflet Quick Start Guide*/

var mymap = L.map('mapid').setView([51.505, -0.09], 13);

//add tile layer...replace project id and accessToken with your own

var l = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap);

//create point for standalone popup to go identified using coordinates
var marker = L.marker([51.5, -0.09]).addTo(mymap);

//create circle with center at specified coordinates
var circle = L.circle([51.508, -0.11], {
    //specify outline and fill colors, opacity, radius
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

//create polygon with 3 points identified below
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

//"bind" a popup to the marker
marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();
//bind popups to the circle and polygon but don't open them yet
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//create a popup that isn't associated with any of the shapes at a specific point and open it upon loading
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

var popup = L.popup();

//define a function that, when called, creates a popup at hte clicked lat and long
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

//on a map click call the onMapClick function
mymap.on('click', onMapClick);