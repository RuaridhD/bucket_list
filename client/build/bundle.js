/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

// const CountryView = require("./views/countryView")
const Request = __webpack_require__(1);
const CountryView = __webpack_require__(2)
const Country = __webpack_require__(3)
const MapWrapper = __webpack_require__(4)

// const countryView = new CountryView();
const request = new Request('http://restcountries.eu/rest/v2/all');
const dbRequest = new Request('http://localhost:3000/api/bucket-list');

const countryView = new CountryView();

let mainMap;

const appStart = function(){
  request.get(getCountriesRequestComplete);
  const mapDiv = document.getElementById('country-map');
  mainMap = new MapWrapper(mapDiv, [0, 0], 2);
  dbRequest.get(getSavedCountriesRequestComplete);

}

const getSavedCountriesRequestComplete = function(allSavedCountries) {
  allSavedCountries.forEach(function(country) {
    if (country.coords && country.coords.length === 2) {
      mainMap.addMarker(country.coords);
    }
  })
  countryView.addToList(allSavedCountries);
}

const getCountriesRequestComplete = function(allCountries) {
  allCountries.forEach(function(country) {

    const newCountry = new Country({
      name: country.name,
      coords: country.latlng
    })
    countryView.addCountry(newCountry);
  })
  const saveButton = document.querySelector('#submit');
  saveButton.addEventListener('click', handleButtonClick);
  const deleteButton = document.querySelector("#deleteButton");
  deleteButton.addEventListener("click", handleDeleteClick);
}

const handleButtonClick = function(event) {
  event.preventDefault();
  const selectedCountry = document.querySelector('#select-country').value;
  const selectedCountryParsed = JSON.parse(selectedCountry);
  dbRequest.post(selectedCountryParsed, saveRequestComplete);
}

const handleDeleteClick = function(event) {
  event.preventDefault();
  dbRequest.delete(deleteRequestComplete);
}

const saveRequestComplete = function(country){
  if (country.coords && country.coords.length === 2) {
    mainMap.addMarker(country.coords);
  }
}

const deleteRequestComplete = function(){
  countryView.clear();
}


window.addEventListener('load', appStart);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

const Request = function(url) {
  this.url = url;
}

Request.prototype.get = function(next) {
  const request = new XMLHttpRequest();
  request.open("GET", this.url);
  request.addEventListener("load", function() {
    if (this.status !== 200) return;
    const responseBody = JSON.parse(this.response);
    next(responseBody);
  });
  request.send()
};

Request.prototype.post = function (country, next) {
  const request = new XMLHttpRequest();
  request.open("POST", this.url);
  request.setRequestHeader("Content-Type", "application/json")
  request.addEventListener("load", function(){
    if (this.status !== 201) return;
    const responseBody = JSON.parse(this.response);
    next(responseBody);
  });
  request.send(JSON.stringify(country));
};

Request.prototype.delete = function(next){
  const request = new XMLHttpRequest();
  request.open("DELETE", this.url);
  request.addEventListener("load", function(){
    if (this.status !== 204) return;
    next();
  });
  request.send();
};

module.exports = Request;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

const CountryView = function() {
  this.countries = [];
}

CountryView.prototype.addCountry = function(country) {
  this.countries.push(country);
  this.addToDropDown(country);
}

CountryView.prototype.addToDropDown = function(country) {
  const selector = document.querySelector('#select-country');
  const option = document.createElement('option');
  option.textContent = country.name;
  option.value = JSON.stringify(country);
  selector.appendChild(option);
}

CountryView.prototype.addToList = function(countries){
  const ul = document.querySelector('#saved-countries');
  countries.forEach(function(country){
    const li = document.createElement('li');
    li.textContent = country.name;
    ul.appendChild(li);
  })
}

CountryView.prototype.clear = function() {
  this.countries = [];
  const ul = document.querySelector('#saved-countries');
  ul.innerHTML = '';
}


module.exports = CountryView;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

const Country = function(options){
  this.name = options.name,
  this.coords = options.coords
};

module.exports = Country;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

const MapWrapper = function(element, coords, zoom) {
 const osmLayer = new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
 this.map = L.map(element)
 .addLayer(osmLayer)
 .setView(coords, zoom);
}

MapWrapper.prototype.addMarker = function (coords) {
 L.marker(coords).addTo(this.map);
};

module.exports = MapWrapper;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map