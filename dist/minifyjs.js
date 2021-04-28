let quakeRepository = (function () {
		let e = [];
		function t(t) {
			'object' == typeof t
				? e.push(t)
				: alert(
						'That is not allowed.  You have attempted to add incorrect quake information'
				  );
		}
		function n(e) {
			a(e).then(function () {
				let t = document.createElement('ul');
				t.classList.add('list-group'),
					$('#myModal').find('.modal-body').text('');
				let n = document.createElement('li');
				n.innerText = 'Event URL: ';
				var a = document.createElement('a');
				(a.textContent = e.nonJsonUrl),
					a.setAttribute('href', e.nonJsonUrl),
					a.setAttribute('target', '_blank'),
					n.appendChild(a),
					t.appendChild(n),
					$('#body-modal').append(n);
				let o = document.createElement('li');
				(o.innerText = 'Magnitude: ' + e.magnitude),
					t.appendChild(o),
					$('#body-modal').append(o);
				let i = document.createElement('li');
				(i.innerText = 'Latitude: ' + e.latitude),
					t.appendChild(i),
					$('#body-modal').append(i);
				let u = document.createElement('li');
				(u.innerText = 'Longitude: ' + e.longitude),
					t.appendChild(u),
					$('#body-modal').append(u);
				let l = document.createElement('li');
				(l.innerText = 'Depth (km): ' + e.depth),
					t.appendChild(l),
					$('#body-modal').append(l),
					$('#myModal').find('.modal-title').text(e.name),
					$('#myModal').modal();
			});
		}
		function a(e) {
			o();
			let t = e.detailURL;
			return fetch(t)
				.then(function (e) {
					return e.json();
				})
				.then(function (t) {
					(e.nonJsonUrl = t.properties.url),
						(e.magnitude = t.properties.mag.toFixed(1)),
						(e.latitude = t.geometry.coordinates[0].toFixed(4)),
						(e.longitude = t.geometry.coordinates[1].toFixed(4)),
						(e.depth = t.geometry.coordinates[2].toFixed(3)),
						i();
				})
				.catch(function (e) {
					i(), console.error(e);
				});
		}
		function o() {
			console.log(
				'Sit tight while we get that information pulled together for ya'
			);
		}
		function i() {
			console.clear();
		}
		return {
			add: t,
			getAll: function () {
				return e;
			},
			addListItem: function (e) {
				let t = $('.list-group'),
					a = $('<li></li>');
				(eventButton = $('<button />')
					.addClass('btn btn-primary button-quake')
					.attr('data-toggle', 'modal')
					.attr('data-target', 'myModal')
					.text(e.name)),
					a.append(eventButton),
					a.addClass('group-list-item'),
					a.on('click', function () {
						n(e);
					}),
					t.append(a);
			},
			showDetails: n,
			loadList: function () {
				return (
					o(),
					fetch(apiUrl)
						.then(function (e) {
							return e.json();
						})
						.then(function (e) {
							e.features.forEach(function (e) {
								t({
									name: e.properties.title,
									detailURL: e.properties.detail,
									nonJsonUrl: null,
									magnitude: null,
									latitude: null,
									longitude: null,
									depth: null,
								}),
									i();
							});
						})
						.catch(function (e) {
							i(), console.error(e);
						})
				);
			},
			loadDetails: a,
			showLoadingMessage: o,
			hideLoadingMessage: i,
			assembleTargetURL: function () {
				let e = $('#input-start-date').val(),
					t = $('#input-end-date').val(),
					n = $('#input-center-latitude').val(),
					a = $('#input-center-longitude').val(),
					o = $('#input-event-radius').val();
				return (
					(apiUrl =
						'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&starttime=' +
						e +
						'&endtime=' +
						t +
						'&latitude=' +
						n +
						'&longitude=' +
						a +
						'&maxradiuskm=' +
						o),
					apiUrl
				);
			},
		};
	})(),
	validateInput = (function () {
		let e = document.querySelector('#input-start-date'),
			t = document.querySelector('#input-end-date'),
			n = document.querySelector('#input-center-latitude'),
			a = document.querySelector('#input-center-longitude'),
			o = document.querySelector('#input-event-radius');
		document.querySelector('#user-input');
		function i() {
			return new Date(e.value) > new Date(t.value)
				? (s(e, 'Start date must be before end date'), !1)
				: (s(e, null), !0);
		}
		function u() {
			let e = new Date();
			return new Date(t.value) > e
				? (s(t, 'End date cannot be later than today.'), !1)
				: (s(t, null), !0);
		}
		function l() {
			let e = n.value;
			return e < -90 || e > 90
				? (s(n, 'Latitude must be between -90 and 90'), !1)
				: (s(n, null), !0);
		}
		function r() {
			let e = a.value;
			return e < -180 || e > 180
				? (s(a, 'Longitude must be between -180 and 180'), !1)
				: (s(a, null), !0);
		}
		function d() {
			let e = o.value;
			return (
				e || s(o, 'A radius is required'),
				e <= 0
					? (s(o, 'Radius must be a positive number'), !1)
					: (s(o, null), !0)
			);
		}
		function c() {
			let e = i(),
				t = u(),
				n = l(),
				a = r(),
				o = d();
			return e && t && n && a && o;
		}
		function s(e, t) {
			let n = e.parentElement,
				a = n.querySelector('.error-message');
			if ((a && n.removeChild(a), t)) {
				let e = document.createElement('div');
				e.classList.add('error-message'), (e.innerText = t), n.appendChild(e);
			}
		}
		return (
			e.addEventListener('input', i),
			t.addEventListener('input', u),
			n.addEventListener('input', l),
			a.addEventListener('input', r),
			o.addEventListener('input', d),
			{
				validateForm: c,
				runSearch: function () {
					c()
						? (quakeRepository.assembleTargetURL(),
						  quakeRepository.loadList().then(function () {
								quakeRepository.getAll().forEach(function (e) {
									quakeRepository.addListItem(e);
								});
						  }))
						: alert('You have an error');
				},
			}
		);
	})();
