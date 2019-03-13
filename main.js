//main.js

/* Javascript by Catherine McSorley, 2019 */
/* Example from Leaflet Quick Start Guide*/

var mymap = L.map('mapid').setView([20, 0], 2);
var type = "";
//1. add tile layer
var l = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap);

//Step 3: Add circle markers for point features to the map
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 1/7500;
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
        fillColor: "#8acc90",
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
    if(type=="country"){
        map.eachLayer(function(layer){
            if (layer.feature && layer.feature.properties[attribute]){
                var props = layer.feature.properties;

                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute]);
                layer.setRadius(radius);

                //change the popup based on whether visualizing country or regional data
                var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";
                var year = attribute.substring(1,5);


                popupContent +="<p><b>Number of U.S. bound Emigrants in " + year + ":</b> " + layer.feature.properties[attribute];

                //replace the layer popup
                layer.bindPopup(popupContent, {
                    offset: new L.Point(0,-radius)
                });

            };
        });
    } else if(type=="region") {
        map.eachLayer(function(layer){
            if (layer.feature && layer.feature.properties[attribute]){
                var props = layer.feature.properties;

                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute]);
                layer.setRadius(radius);

                //change the popup based on whether visualizing country or regional data
                var popupContent = "<p><b>Region:</b> " + props.Region + "</p>";
                var year = attribute.substring(1,5);


                popupContent +="<p><b>Number of U.S. bound Emigrants in " + year + ":</b> " + layer.feature.properties[attribute];

                //replace the layer popup
                layer.bindPopup(popupContent, {
                    offset: new L.Point(0,-radius)
                });

            };
        });
    }
updateLegend(map,attribute);
};


function createSequenceControls(mymap,attributes,type){
    //create range input element (slider)
        
    
        var SequenceControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },

            onAdd: function(mymap) {
                var container = L.DomUtil.create('div','sequence-control-container');

                $(container).append('<input class="range-slider" type="range">');
                $(container).append('<button class="skip" id="reverse"><</button>');
                $(container).append('<button class="skip" id="forward">></button>');


                L.DomEvent.disableClickPropagation(container);
                return container;

            }
        });
          mymap.addControl(new SequenceControl);  
    
    //set slider attributes
            $('.range-slider').attr({
                max: 6,
                min: 0,
                value: 0,
                step: 1
            });
              //below Example 3.4...add skip buttons
            

            //Below Example 3.6 in createSequenceControls()

            //Example 3.12 line 7...Step 5: input listener for slider
            $('.range-slider').on('input', function(){
                    var i=0;
                    mymap.eachLayer(function(layer){
                        if(layer.feature){
                            i=(i+1)%8;
                        }
                    })
                    if(i==0){
                        type = "region";
                    } else {
                        type = "country";
                    }
                i=0;
                //Step 6: get the new index value
                var index = $(this).val();
                 //Called in both skip button and slider event listener handlers
                //Step 9: pass new attribute to update symbols
                updatePropSymbols(mymap, attributes[index], type);
            });
        
                                  
            
         //Example 3.12 line 2...Step 5: click listener for buttons
            $('.skip').click(function(){
                    var j=0;
                    mymap.eachLayer(function(layer){
                        if(layer.feature){
                            j=((j+1)%8);
                        }
                    }) 
                    if(j==0){
                        type = "region";
                    } else { 
                        type = "country";
                    }
                j=0;
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
                updatePropSymbols(mymap, attributes[index], type);
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
            getRegionalData(mymap,0);
    }
        
    if(document.getElementById("country").checked){
             mymap.eachLayer(function(layer){
               if (layer.feature){
                  mymap.removeLayer(layer);
              }
           })
            getData(mymap,1);
    }
    })
}

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Example 3.7 line 1...Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.substring(1,5);
    var content = "Number of U.S. Bound Emigrants in " + year;

     //replace legend content
    $('#temporal-legend').html(content);
    
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
    
    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 70 - radius,
            cx: 25,
            r: radius
        });
         //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100);
    };
    
   
    
};

function createLegend(map,attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        
        onAdd: function(map){
            var container = L.DomUtil.create('div','legend-control-container');
            
            $(container).append('<div id="temporal-legend">');
            
            var svg = '<svg id="attribute-legend" width="180px" height="180px">';
            
                    //Example 3.6 line 4...array of circle names to base loop on
            var circles = {
                max: 30,
                mean: 50,
                min: 70
            };

            //Step 2: loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + 
                '" fill="#8acc90" fill-opacity="0.8" stroke="#000000" cx="90"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="50" y="' + circles[circle] + '"></text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);
            
            return container;
        }
    });
    
    map.addControl(new LegendControl());
    
    updateLegend(map,attributes[0]);
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
    
    return attributes;
};


//Step 2: Import GeoJSON data
function getData(mymap,go,type){
    //load the data
    $.ajax("data/LabData.geojson", {
        dataType: "json",
        success: function(response){
            type = "country";
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, mymap, attributes,type);
           if(go==0){ 
               createSequenceControls(mymap, attributes,type);
                createLegend(mymap,attributes);
           } else {
               updateLegend(mymap, attributes[0]);
               //reset the slider
               $('.range-slider').val(0);
           }
            createRadioControls(mymap,attributes);
            
        }
    });
};

function getRegionalData(mymap,go,type){
    //load the data
    $.ajax("data/RegionalCoords.geojson", {
        dataType: "json",
        success: function(response){
            type = "region";
            var attributes = processRegionalData(response);
            //call function to create proportional symbols
            createPropSymbols(response, mymap, attributes,type);
            updateLegend(mymap, attributes[0]);
            //reset the slider
            $('.range-slider').val(0);
        }
    }); 
};

$(document).ready(getData(mymap,0,type));