//main.js

/* Javascript by Catherine McSorley, 2019 */
/* Example from Leaflet Quick Start Guide*/

var mymap = L.map('mapid').setView([20, 0], 1.25);

//1. add tile layer
var l = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap);

//Step 3: Add circle markers for point features to the map
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 1/25000;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function pointToLayer(feature, latlng, attributes,type){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    
    if(type=="country"){
    //build popup content string
        var popupContent = "<p><b>Country:</b> " + feature.properties.Country;
        popupContent += "<p><b>Number of U.S. bound Emigrants in 1990: </b> " + feature.properties[attribute];
    } else {
        var popupContent = "<p><b>Region:</b> " + feature.properties.Region;
        popupContent += "<p><b>Number of U.S. bound Emigrants in 1990: </b> " + feature.properties[attribute];
    }
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius) 
    });
    
    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes,type){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes,type);
        }
    }).addTo(mymap);
};


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute,type){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            //change the popup based on whether visualizing country or regional data
            if(type=="country"){
            //add city to popup content string
            var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";
            } else {
                var popupContent = "<p><b>Region:</b> " + props.Region + "</p>";
            }
            var year = attribute.substring(1,5);
            
            
            popupContent +="<p><b>Number of U.S. bound Emigrants in " + year + ":</b> " + layer.feature.properties[attribute];

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
            
        };
    }); console.log("success");
};


function createSequenceControls(mymap,attributes,type){
    //create range input element (slider)
    $('#panel').html('<input class="range-slider" type="range">');
    
    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
      //below Example 3.4...add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Backward</button>');
    $('#panel').append('<button class="skip" id="forward">Forward</button>');
    
    //Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //sequence
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //sequence
    }); 
    
    //Example 3.12 line 7...Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        
         //Called in both skip button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(mymap, attributes[index],type);
    });

 //Example 3.12 line 2...Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        
         //Called in both skip button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(mymap, attributes[index],type);
    });

};

//this function changes the data imported depending on what the user has selected
function createRadioControls(mymap,attributes){
    $('.form-radio').click(function(){
    if(document.getElementById("region").checked){
           mymap.eachLayer(function(layer){
               if (layer.feature){
                    mymap.removeLayer(layer);
               }
           }) 
            getRegionalData(mymap);
    }
        
    if(document.getElementById("country").checked){
             mymap.eachLayer(function(layer){
               if (layer.feature){
                  mymap.removeLayer(layer);
              }
           })
            getData(mymap);
    }
    })
}


function processData(data){
    //empty array to hold attributes
    var attributes = [];
   //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute!="Country"){
            attributes.push(attribute);
        };
    };
    //console.log(attributes);
    
    return attributes;
};

//same as processData, slightly altered
function processRegionalData(data){
    //empty array to hold attributes
    var attributes = [];
   //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute!="Region"){
            attributes.push(attribute);
        };
    };
    //console.log(attributes);
    
    return attributes;
};

//Step 2: Import GeoJSON data
function getData(mymap){
    //load the data
    $.ajax("data/LabData.geojson", {
        dataType: "json",
        success: function(response){
            var type = "country";
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, mymap, attributes,type);
            createSequenceControls(mymap, attributes,type);
            createRadioControls(mymap,attributes);
        }
    });
};

function getRegionalData(mymap){
    //load the data
    $.ajax("data/RegionalCoords.geojson", {
        dataType: "json",
        success: function(response){
            //console.log("success");
            var type = "region";
            var attributes = processRegionalData(response);
            //console.log(response);
            //call function to create proportional symbols
            createPropSymbols(response, mymap, attributes, type);
            createSequenceControls(mymap, attributes,type);
        }
    }); 
};

   

$(document).ready(getData(mymap));