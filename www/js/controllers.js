angular.module('starter.controllers', [])


.controller('NovoCtrl', function($scope) {})

.controller('EstacionarCtrl', function($scope) {
	// comunicacao com a pagina html aqui 

var socket = io('http://localhost:3000');
  var teste;
  var escolhe;
  var imagem = $(".imagem-smile");

  socket.on('news', function (data) {
  

       
    $("#dist").text(data/100);
    if(data<=4000){
     // teste= (1-(data/3000)).toFixed(2) ;
      console.log(data);
      	if(data<=15){
      	escolhe= 1;//triste
        }
        else if(data<=25 && data>15){
        	escolhe= 2; // feliz
        }
        if(data>25){
        	escolhe=3; // normal
        }
        
        imagem.attr("src" , "../img/smile-"+escolhe+".png" );
    	}
    
    	//escolhe=0;
    	//imagem.attr("src" , "../img/smile-"+escolhe+".png" );
   	
  		});// funcao socket
		 


})// fechando

.controller('MapaCtrl', function($scope, $state, $cordovaGeolocation, $http, bancoDeOcorrencias) {
	var p, d;
	
 	bancoDeOcorrencias.buscarTodas().then(function(respostaDoServidor){
 		$scope.totens = respostaDoServidor.data;
	 	console.log('1: $scope.totens = ', $scope.totens)

	 	var options = {timeout: 5000, enableHighAccuracy: true};
	 
		$cordovaGeolocation.getCurrentPosition(options).then(function(position){
		 
		    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		 
		    var mapOptions = {
		      center: latLng,
		      zoom: 15,
		      mapTypeId: google.maps.MapTypeId.ROADMAP
		    };
		 
		    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

 			var contentString = "hello world";

		    var infowindow = new google.maps.InfoWindow();

		    var marker, i;

		 	for(var i=0; i<$scope.totens.length; i++) {
		 		var totem = $scope.totens[i];
		 		console.log(totem.latitude);
		 		console.log(totem.longitude);

				  marker = new google.maps.Marker({
				      map: $scope.map,
				      animation: google.maps.Animation.DROP,
				      position: new google.maps.LatLng(totem.latitude, totem.longitude)
				  }); // fecha marker	

				  google.maps.event.addListener(marker, 'click', (function(marker, i) {
			        return function() {
			          infowindow.setContent($scope.totens[i].nome);
			          infowindow.open(map, marker);
			        }
			      })(marker, i));

   			}; //fecha o for



	//funções que transformam o input do usuário em lat e long e atualizam o mapa.
	$scope.loookupLatLng = function() {
	        
	        var geocoder = new google.maps.Geocoder();
	        geocoder.geocode(
	          {'address': $scope.search.endereco},
	          function(results, status) {
	            var lat = results[0].geometry.location.lat();
	            var lng = results[0].geometry.location.lng();

	            // atualiza os valores de latitude e longitude que vão para o centro do mapa
	            $scope.search.latitude = lat;
	            $scope.search.longitude = lng;

	            console.log('Latitude Enviada: ' + $scope.search.latitude);
	            console.log('Longitude Enviada: ' + $scope.search.longitude);
	          	console.log($scope.search);


				var latLng = new google.maps.LatLng($scope.search.latitude, $scope.search.longitude);
					 
				var mapOptions = {
			      center: latLng,
			      zoom: 15,
   				  mapTypeId: google.maps.MapTypeId.ROADMAP
				};
					 
				$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

				var infowindow = new google.maps.InfoWindow();

			    var marker, i;

				for(var i=0; i<$scope.totens.length; i++) {
					var totem = $scope.totens[i];
					console.log(totem.latitude);
					console.log(totem.longitude);

					var marker = new google.maps.Marker({
				      map: $scope.map,
					  animation: google.maps.Animation.DROP,
				      position: new google.maps.LatLng(totem.latitude, totem.longitude),
			    	  }); //fecha o marker    

					google.maps.event.addListener(marker, 'click', (function(marker, i) {
				        return function() {
				          infowindow.setContent("O " + $scope.totens[i].nome + " tem totens pra te ajudar a estacionar. O valor para estacionar aqui é: R$5,00/hora");
				          
				          infowindow.open(map, marker);
				          
				          
				          navigator.geolocation.getCurrentPosition(function (position) {
						    p = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						    d = new google.maps.LatLng(totem.latitude, totem.longitude);
						    console.log("Endereco de partida: "+p+" e Endereco de destino: "+d);   

						  $scope.newRota = function(partida, destino) {
						  	console.log("você clicou no botão!!")
						  	var directionsDisplay;
							var directionsService = new google.maps.DirectionsService();
							var map;

							$scope.calcRoute = function(partida, destino) {
								console.log("entrou no calcRoute");
							  var start = p;
							  var end = d;
							  console.log("o valor de start é "+p+" e o valor de end é "+d);
							  var request = {
							    origin: start,
							    destination: end,
							    travelMode: google.maps.TravelMode.DRIVING
							  };

							  directionsService.route(request, function(result, status) {
							    if (status == google.maps.DirectionsStatus.OK) {
							      directionsDisplay.setDirections(result);
								  directionsDisplay.setPanel(document.getElementById("trajeto-texto"));
							    }
							  });
							}//fecha calroute

							$scope.initialize = function(partida, destino) {
								console.log("entrou no inicialize");
							  directionsDisplay = new google.maps.DirectionsRenderer();
							  var mapOptions = {
							    zoom:7,
							    center: partida,
							    mapTypeId: google.maps.MapTypeId.ROADMAP,
							  };
							  map = new google.maps.Map(document.getElementById("map"), mapOptions);
							  directionsDisplay.setMap(map);
							  $scope.calcRoute(partida, destino);
							}

							$scope.initialize(partida, destino);
							

						  }//fecha newRota()




						  }); // fecha o navigator.geolocation e as variáveis partida e destino
				        }//fecha return function
				      })(marker, i));	
				}; //fecha o for

	          } // fecha geocode e variáveis $scope.lat e $scope.lng
	        )} //fecha loookuplatlng

	   $scope.search = {};
	   $scope.newSearch = function() {
	  	console.log("você clicou em procurar")

	  	console.log("1. o scope misterioso é" , $scope.search);

	  	$scope.loookupLatLng()

	  }

	}, function(error){
		console.log("Could not get location");
			  
	}) //fecha cordova geolocation
	
	}) //fecha função buscar no banco de ocorrencias

}); // Fecha o SearchCtrl