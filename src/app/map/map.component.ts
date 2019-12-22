import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../map-service.service';
import { MapModel } from '../map-model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  dataList: Array<MapModel> = new Array<MapModel>();
  states: Array<string> = new Array<string>();
  districts: any;
  cities: Array<MapModel> = new Array<MapModel>();
  locations: Array<any> = new Array<any>();

  @ViewChild('gmap', { read: true, static: true }) gmapElement: any;
  map: google.maps.Map;
  selectedState: string;
  selectedDistrict: string;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getMapDetails();
    
    // Not necessary Called just to intialize Map on Page Load
    this.displayMap(this.getMarker);
  }

  //Response from Map Api
  getMapDetails = () => {
    this.apiService.getMapDetails().subscribe((data) => {
      this.dataList = data;

      //Filtering Distincts State Names
      this.states = [...new Set(this.dataList.map(item => item.State))];

    });
  }

  //Select all District for an state 
  selectDistricts = (state: string) => {
    this.selectedState = state;
    this.districts = this.dataList.filter(x => x.State == state);
    this.districts = [...new Set(this.districts.map(item => item.District))];
  }

  //Select all cities of an District
  selectCities = (district: string) => {
    this.selectedDistrict = district;
    this.locations = [];
    this.cities = this.dataList.filter(x => x.District == district && x.State == this.selectedState);

    //Send name of City  to getLatLongFromGeoCoder() to get Coordinates
    for (let cityVO of this.cities) {
      var address = `${cityVO.City}, ${cityVO.District}`;
      this.getLatLongFromGeoCoder(address, this.getCoord);
    }

    setTimeout(() => {
      this.displayMap(this.getMarker);
    }, 1000);
  }

  // getting Lattitude and Longitude by address from Google.Map.GeoCoder
  getLatLongFromGeoCoder = (address: any, getCoord: any) => {
    var map = new google.maps.Geocoder();
    map.geocode({ 'address': address }, function (results, status) {
      if (results) {
        let lat = results[0].geometry.location.lat();
        let lng = results[0].geometry.location.lng();
        getCoord([address, lat, lng]);
      }

    });

  }

  //Adding Coordinates into locations List
  getCoord = (coords: any) => {
    this.locations.push(coords)
    // displayMap();


  }

  //Map Integration 
  displayMap = (getMarker: any) => {

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4, //setting Zoom Level
      center: new google.maps.LatLng(21.1458, 79.0882), //setting Center of Map
      mapTypeId: google.maps.MapTypeId.ROADMAP // //setting Type of Map
    });

    var infowindow = new google.maps.InfoWindow();
    var marker, i;

    for (i = 0; i < this.locations.length; i++) {
      getMarker(marker, i, map, infowindow, this.locations);
    }

  }

  // get Marker and on click of marker info 
  getMarker = (marker: any, i: number, map: any, infowindow: any, locations: any) => {

    // Marker Location
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map
    });

    // Get Info on click of marker
    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        infowindow.setContent(locations[i][0]);
        infowindow.open(map, marker);
      }
    })(marker, i));
  }

}
