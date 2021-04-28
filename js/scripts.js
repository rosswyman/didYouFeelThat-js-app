// IIFE creates a new array quakeRepository while leaving original quakeList unchanged
let quakeRepository = (function () {
	// initial array declartion
	let quakeList = [];

	// // adds a new quake to the end of quakeRepository
	function add(quake) {
		// Checks to see if the parameter being passed to the add function is an object
		if (typeof quake === 'object') {
			quakeList.push(quake);
		} else {
			alert(
				'That is not allowed.  You have attempted to add incorrect quake information'
			);
		}
	}

	// returns the list of earthquakes
	function getAll() {
		return quakeList;
	}

	// creates an unordered list of earthquakes that the user can click on for details
	function addListItem(quake) {
		let quakeList = $('.list-group');
		let li = $('<li></li>');

		eventButton = $('<button />')
			.addClass('btn btn-primary button-quake')
			.attr('data-toggle', 'modal')
			.attr('data-target', 'myModal')
			.text(quake.name);

		li.append(eventButton);
		li.addClass('group-list-item');
		li.on('click', function () {
			showDetails(quake);
		});

		quakeList.append(li);
	}

	// Shows the details of an earthquake by calling the showDialog function when the button is pressed
	function showDetails(quake) {
		loadDetails(quake).then(function () {
			// Create an unordered list with details
			let quakeDetails = document.createElement('ul');
			quakeDetails.classList.add('list-group');

			// Clear out existing text
			$('#myModal').find('.modal-body').text('');

			// Create list items of quake details and add to parent list

			let quakeDetailURL = document.createElement('li');
			quakeDetailURL.innerText = 'Event URL: ';
			var USGSUrl = document.createElement('a');
			USGSUrl.textContent = quake.nonJsonUrl;
			USGSUrl.setAttribute('href', quake.nonJsonUrl);
			USGSUrl.setAttribute('target', '_blank');
			quakeDetailURL.appendChild(USGSUrl);
			quakeDetails.appendChild(quakeDetailURL);
			$('#body-modal').append(quakeDetailURL);

			let quakeDetailMagnitude = document.createElement('li');
			quakeDetailMagnitude.innerText = 'Magnitude: ' + quake.magnitude;
			quakeDetails.appendChild(quakeDetailMagnitude);
			$('#body-modal').append(quakeDetailMagnitude);

			let quakeDetailLatitude = document.createElement('li');
			quakeDetailLatitude.innerText = 'Latitude: ' + quake.latitude;
			quakeDetails.appendChild(quakeDetailLatitude);
			$('#body-modal').append(quakeDetailLatitude);

			let quakeDetailLongitude = document.createElement('li');
			quakeDetailLongitude.innerText = 'Longitude: ' + quake.longitude;
			quakeDetails.appendChild(quakeDetailLongitude);
			$('#body-modal').append(quakeDetailLongitude);

			let quakeDetailDepth = document.createElement('li');
			quakeDetailDepth.innerText = 'Depth (km): ' + quake.depth;
			quakeDetails.appendChild(quakeDetailDepth);
			$('#body-modal').append(quakeDetailDepth);

			$('#myModal').find('.modal-title').text(quake.name);
			$('#myModal').modal();
		});
	}

	// Fetches a list of earthqukes meeting the user criteria from USGS
	function loadList() {
		showLoadingMessage();
		return fetch(apiUrl)
			.then(function (response) {
				return response.json();
			})
			.then(function (json) {
				json.features.forEach(function (item) {
					// Define what information will be gather for each earthquake
					let quake = {
						name: item.properties.title,
						detailURL: item.properties.detail,
						// The following fields that will be populated from detailURL
						nonJsonUrl: null,
						magnitude: null,
						latitude: null,
						longitude: null,
						depth: null,
					};

					add(quake);
					hideLoadingMessage();
				});
			})
			.catch(function (e) {
				hideLoadingMessage();
				console.error(e);
			});
	}

	function loadDetails(quake) {
		showLoadingMessage();
		let url = quake.detailURL;
		return fetch(url)
			.then(function (response) {
				return response.json();
			})
			.then(function (item) {
				quake.nonJsonUrl = item.properties.url;
				quake.magnitude = item.properties.mag.toFixed(1);
				quake.latitude = item.geometry.coordinates[0].toFixed(4);
				quake.longitude = item.geometry.coordinates[1].toFixed(4);
				quake.depth = item.geometry.coordinates[2].toFixed(3);
				hideLoadingMessage();
			})
			.catch(function (e) {
				hideLoadingMessage();
				console.error(e);
			});
	}

	function showLoadingMessage() {
		console.log(
			'Sit tight while we get that information pulled together for ya'
		);
	}

	function hideLoadingMessage() {
		console.clear();
	}

	function assembleTargetURL() {
		// Gather user input to create the USGS search string
		let startDate = $('#input-start-date').val();
		let endDate = $('#input-end-date').val();
		let latitude = $('#input-center-latitude').val();
		let longitude = $('#input-center-longitude').val();
		let radius = $('#input-event-radius').val();
		let assembledTargetURL =
			'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&starttime=' +
			startDate +
			'&endtime=' +
			endDate +
			'&latitude=' +
			latitude +
			'&longitude=' +
			longitude +
			'&maxradiuskm=' +
			radius;
		// Assign to target variable for function loadList
		apiUrl = assembledTargetURL;

		// Call load
		loadList().then(function () {
			// Now the data is loaded!
			getAll().forEach(function (quake) {
				addListItem(quake);
			});
		});
	}

	return {
		add: add,
		getAll: getAll,
		addListItem: addListItem,
		showDetails: showDetails,
		loadList: loadList,
		loadDetails: loadDetails,
		showLoadingMessage: showLoadingMessage,
		hideLoadingMessage: hideLoadingMessage,
		assembleTargetURL: assembleTargetURL,
	};
})();

let validateInput = (function () {
	let startDateInput = document.querySelector('#input-start-date');
	let endDateInput = document.querySelector('#input-end-date');
	let latitudeInput = document.querySelector('#input-center-latitude');
	let longitudeInput = document.querySelector('#input-center-longitude');
	let radiusInput = document.querySelector('#input-event-radius');
	let form = document.querySelector('#user-input');

	function validateStartDate() {
		console.log('validateStartDate called');

		let sDate = new Date(startDateInput.value);
		let eDate = new Date(endDateInput.value);

		console.log('Start date is ' + sDate);
		console.log('End date is ' + eDate);

		if (sDate > eDate) {
			showErrorMessage(startDateInput, 'Start date must be before end date');
			console.log('Start date is invalid');
			return false;
		}

		showErrorMessage(startDateInput, null);
		console.log('Start date is valid');
		return true;
	}

	function validateEndDate() {
		console.log('validateEndDate called');

		let today = new Date();
		let eDate = new Date(endDateInput.value);

		console.log('today is ' + today);
		console.log('End date is ' + eDate);

		if (eDate > today) {
			showErrorMessage(endDateInput, 'End date cannot be later than today.');
			console.log('End date is invalid');
			return false;
		}

		showErrorMessage(endDateInput, null);
		console.log('End date is valid.');
		return true;
	}

	function validateLatitude() {
		let lat = latitudeInput.value;
		if (lat < -90 || lat > 90) {
			showErrorMessage(latitudeInput, 'Latitude must be between -90 and 90');
			return false;
		}

		showErrorMessage(latitudeInput, null);
		return true;
	}

	function validateLongitude() {
		let lat = longitudeInput.value;
		if (lat < -180 || lat > 180) {
			showErrorMessage(
				longitudeInput,
				'Longitude must be between -180 and 180'
			);
			return false;
		}

		showErrorMessage(longitudeInput, null);
		return true;
	}

	function validateRadius() {
		console.log('validateRadius called');

		let value = radiusInput.value;

		if (!value) {
			showErrorMessage(radiusInput, 'A radius is required');
		}
		if (value <= 0) {
			showErrorMessage(radiusInput, 'Radius must be a positive number');
			console.log('Radius is invalid');
			return false;
		}

		showErrorMessage(radiusInput, null);
		console.log('Radius is valid');
		return true;
		// return value && isPositive;
	}

	function showErrorMessage(input, message) {
		let container = input.parentElement; // The .input-wrapper

		// Remove an existing error
		let error = container.querySelector('.error-message');
		if (error) {
			container.removeChild(error);
		}

		// Now add the error, if the message is not empty
		if (message) {
			let error = document.createElement('div');
			error.classList.add('error-message');
			error.innerText = message;
			container.appendChild(error);
		}
	}

	startDateInput.addEventListener('input', validateStartDate);
	endDateInput.addEventListener('input', validateEndDate);
	latitudeInput.addEventListener('input', validateLatitude);
	longitudeInput.addEventListener('input', validateLongitude);
	radiusInput.addEventListener('input', validateRadius);
})();
