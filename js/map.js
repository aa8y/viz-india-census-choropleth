CM_ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="http://cloudmade.com">CloudMade</a>';
CM_URL = 'http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/{styleId}/256/{z}/{x}/{y}.png';
OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
OSM_ATTRIB = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';

var distData, distJson, geojson;
var statesLoaded = true;
var map = L.map('map').setView([21, 78], 3);
L.tileLayer(OSM_URL, {attribution: OSM_ATTRIB, styleId: 22677}).addTo(map);

function loadGeoJson() {
  geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
}

function loadDistrictJson() {
  distJson = L.geoJson(distData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
}

map.on('zoomend', function(e) {
  if (map.getZoom() <= 4 && map.hasLayer(distJson)) {
    map.removeLayer(distJson);
  }
});

/*map.on('zoomend', function(e) {
  if (map.getZoom() > 5 && statesLoaded) {
    if (!distData) {
      $.getScript('js/reassign_districts.js', function(data, textStatus, jqxhr) {
        console.log(textStatus); // Success
        console.log("Districts loaded.");
        if (jqxhr.status == 200) {
          map.removeLayer(geojson);
          loadGeoJson();
        }
      });
    }
    statesLoaded = false;
  } else if (map.getZoom() <= 5 && !statesLoaded) {
    $.getScript('js/reassign_states.js', function(data, textStatus, jqxhr) {
      console.log(textStatus); // Success
      console.log("States loaded.");
      if (jqxhr.status == 200) {
        statesLoaded = true;
        distData = '';
        map.removeLayer(geojson);
        loadGeoJson();
      }
    });
  }
});*/

// control that shows state info on hover
var InfoControl = L.Control.extend({

  onAdd: function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  },

  update: function (props) {
    this._div.innerHTML = '<h4>Percentage Population of India</h4>' + (props ? '<b>' + props.NAME_1 + (props.NAME_2 ? ': ' + props.NAME_2 : '') + '</b><br />' + props.POP_PROP_2011 + '%': 'Hover over a region');
  }
});

var info = new InfoControl();
info.addTo(map);

// get color depending on population density value
function getColor(d) {
  return d > 50.0 ? '#800026' :
         d > 25.0 ? '#BD0026' :
         d > 15.0 ? '#E31A1C' :
         d > 10.0 ? '#FC4E2A' :
         d > 5.0  ? '#FD8D3C' :
         d > 2.0  ? '#FEB24C' :
         d > 1.0  ? '#FED976' :
                    '#FFEDA0';
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.POP_PROP_2011)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  var stateName = e.target.feature.properties.NAME_1;
  var fileName = 'data/states/' + stateName.replace(/ /g,"_") + '.js';
  $.getScript(fileName, function(data, textStatus, jqxhr) {
    console.log(textStatus); // Success
    console.log(stateName + " loaded.");
    if (jqxhr.status == 200 && distData) {
      if (map.hasLayer(distJson)) {
        map.removeLayer(distJson);
      }
      loadDistrictJson();
    }
  });
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

loadGeoJson();

map.attributionControl.addAttribution('Population data &copy; <a href="http://censusindia.gov.in/">Indian Census Bureau</a>');
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 5, 10, 15, 25, 50, 100],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length - 1; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + ('&ndash;' + to)
    );
  }

  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);
