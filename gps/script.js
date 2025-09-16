// Initialize map
var map = L.map('map').setView([20.5937, 78.9629], 5); // Default: India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

var marker;

function showLocationDetails(lat, lng, name) {
    document.getElementById('locationDetails').innerHTML =
        `<strong>Location:</strong> ${name ? name : 'Coordinates'}<br>
        <strong>Latitude:</strong> ${lat}<br>
        <strong>Longitude:</strong> ${lng}`;
}

// Search functionality
function searchLocation() {
    var input = document.getElementById('locationInput').value.trim();
    if (!input) return;

    // If input is coordinates
    var coordMatch = input.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
        var lat = parseFloat(coordMatch[1]);
        var lng = parseFloat(coordMatch[3]);
        map.setView([lat, lng], 13);
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lng]).addTo(map);
        showLocationDetails(lat, lng);
        return;
    }

    // Otherwise, use Nominatim geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lng = parseFloat(data[0].lon);
                map.setView([lat, lng], 13);
                if (marker) map.removeLayer(marker);
                marker = L.marker([lat, lng]).addTo(map);
                showLocationDetails(lat, lng, data[0].display_name);
            } else {
                document.getElementById('locationDetails').innerHTML = 'Location not found.';
            }
        })
        .catch(() => {
            document.getElementById('locationDetails').innerHTML = 'Error fetching location.';
        });
}

document.getElementById('searchBtn').onclick = searchLocation;

document.getElementById('locationInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchLocation();
});

// Real-time tracking
var tracking = false;
var watchId = null;
document.getElementById('trackBtn').onclick = function() {
    if (tracking) {
        navigator.geolocation.clearWatch(watchId);
        tracking = false;
        document.getElementById('trackBtn').textContent = 'Track My Location';
        document.getElementById('locationDetails').innerHTML = 'Tracking stopped.';
        return;
    }
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(function(pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            map.setView([lat, lng], 16);
            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng]).addTo(map);
            showLocationDetails(lat, lng, 'Your Real-Time Location');
        }, function() {
            document.getElementById('locationDetails').innerHTML = 'Unable to retrieve your location.';
        });
        tracking = true;
        document.getElementById('trackBtn').textContent = 'Stop Tracking';
        document.getElementById('locationDetails').innerHTML = 'Tracking your location...';
    } else {
        document.getElementById('locationDetails').innerHTML = 'Geolocation is not supported.';
    }
};
