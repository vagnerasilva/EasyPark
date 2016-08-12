angular.module('starter.services', [])

.factory('bancoDeOcorrencias', ['$http', function($http){

  var bancoDeOcorrencias = {

    buscarTodas: function() {

      var url = 'http://localhost:3000/ocorrencias/listar';
      
      return $http.get(url);
    },

  };

  return bancoDeOcorrencias;

}]); //fecha .factory
