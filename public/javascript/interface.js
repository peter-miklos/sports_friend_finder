"use strict"

$(document).ready(function() {

  if (document.getElementById("searchInput")) {
    filterEventDate();
  }

  if (document.getElementById("map")) {
    getEventLocations();
  }

  if (document.getElementById("searchTextField")) {
    calculateCoordinates();
  }

  if (document.getElementById("event_date")) {
    setEventDate();
  }

  $(".clickable-row").click(function() {
    window.location = $(this).data("href");
  });

  $(document).click(function(e){
    var elemId = e.target.parentElement.id
    if (elemId.substring(0, 12) === "requestBasic") {
      var requestId = elemId.substring(13)
      if ($('#requestDetails_' + requestId).is('.hidden')) {
        $('#requestDetails_' + requestId).removeClass('hidden');
        $('#requestDetails_' + requestId).addClass('show');
      }
      else
      {
        $('#requestDetails_' + requestId).removeClass('show');
        $('#requestDetails_' + requestId).addClass('hidden');
      }
    }

      });

  function filterEventDate() {
    $("#searchInput").keyup(function () {
        //split the current value of searchInput
        var data = this.value.toUpperCase().split(" ");
        //create a jquery object of the rows
        var jo = $("#fbody").find("tr");
        if (this.value == "") {
            jo.show();
            return;
        }
        //hide all the rows
        jo.hide();

        //Recusively filter the jquery object to get results.
        jo.filter(function (i, v) {
            var $t = $(this);
            for (var d = 0; d < data.length; ++d) {
                if ($t.text().toUpperCase().indexOf(data[d]) > -1) {
                    return true;
                }
            }
            return false;
        })
        //show the rows that match.
        .show();
    }).focus(function () {
        this.value = "";
        $(this).css({
            "color": "black"
        });
        $(this).unbind('focus');
    }).css({
        "color": "#C0C0C0"
    });
  }

  function calculateCoordinates() {
    if(document.location.href.indexOf("/events/new") != -1) {
      function initialize() {
        var input = document.getElementById('searchTextField');
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
              var place = autocomplete.getPlace();
              document.getElementById('cityLat').value = place.geometry.location.lat();
              document.getElementById('cityLng').value = place.geometry.location.lng();
             });
        }
        google.maps.event.addDomListener(window, 'load', initialize);
    }
  }

  function setEventDate() {
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear()+"-"+(month)+"-"+(day);

    $('#event_date').val(today);
    $('#event_date').attr({'min': today});

    $(function(){
      $("#event_time").each(function(){
        var d = new Date(),
            h = d.getHours(),
            m = d.getMinutes();
        if(h < 10) h = '0' + h;
        if(m < 10) m = '0' + m;
        $(this).attr({
          'value': h + 1 + ':' + m,
          'min': h + ':' + m
        });
      });
    });
  }

  function getEventLocations() {
    $.get("/events/getEventLocations", function(data) {
      addMapToStartPage(data);
    })
  }

  function addMapToStartPage(locations) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        });
        putPinsOnMap(locations, map);
      });
    } else {
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: new google.maps.LatLng(51.5074, .1278)
      });
      putPinsOnMap(locations, map);
    }
  }

  function putPinsOnMap(locations, map) {
    var marker, i;
    var infowindow = new google.maps.InfoWindow();

    for (i = 0; i < locations.length; i++) {
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][0], locations[i][1]),
        icon: locations[i][2],
        map: map
      });

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(locations[i][4]);
          infowindow.open(map, marker);
        }
      })(marker, i));
    }
  }
});
