let originInput, destinationInput, calculateFareButton,
            passengerDropdown, fareEl, options, originAutocomplete, destinationAutocomplete,
            originLatLng, destinationLatLng, mapEl, map

        function initialize() {
            originInput = document.querySelector('#inputOriginAddress');
            destinationInput = document.querySelector('#inputDestinationAddress');
            calculateFareButton = document.querySelector('#buttonCalculateFare');
            passengerDropdown = document.querySelector('#selectPassengersNum');
            fareEl = document.querySelector('#fareEstimate');

            options = {
                type: ['address']
            };

            originAutocomplete = new google.maps.places.Autocomplete(originInput, options);
            destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, options);

            originAutocomplete.addListener('place_changed', () => handleInput(true));
            destinationAutocomplete.addListener('place_changed', () => handleInput(false, true));
            calculateFareButton.addEventListener('click', handleFareCalculation);

            originLatLng, destinationLatLng;
            mapEl = document.querySelector('#map');
        }

        function handleInput(origin = false, dest = false) {
            if (origin) originLatLng = originAutocomplete.getPlace().geometry.location;
            if (dest) destinationLatLng = destinationAutocomplete.getPlace().geometry.location;
        }

        function handleFareCalculation() {
            if (!originLatLng || !destinationLatLng) {
                fareEl.innerText = `You must fill out all fields!`;
                return;
            }
            let directionsService = new google.maps.DirectionsService();
            let bounds = new google.maps.LatLngBounds(originLatLng, destinationLatLng);
            let passengers = parseFloat(passengerDropdown.value);

            map = new google.maps.Map(document.getElementById('map'), {
                center: bounds.getCenter(),
                zoom: 14
            });

            let directionsDisplay = new google.maps.DirectionsRenderer({
                map: map
            });

            let request = {
                origin: originLatLng,
                destination: destinationLatLng,
                travelMode: 'DRIVING'
            };

            let polyline = new google.maps.Polyline({
                path: [originLatLng, destinationLatLng],
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    let miles = response.routes[0].legs[0].distance.value / 1609.344;

                    let baseValue = (miles > 0.125) ? 5.25 : 2;
                    let passengerFee = (passengers > 1) ? 1 : 0;
                    let adjMiles = (baseValue > 2) ? miles - 0.125 : miles;

                    let feeEstimate = (baseValue + passengerFee + (adjMiles * 2.17)).toFixed(2).toLocaleString('en');
                    fareEl.innerText = `Your estimate is $${feeEstimate}!`;

                    // polyline.setMap(map);
                } else {
                    console.log('Error! Something happened: ', status, response);
                }
            });
        }