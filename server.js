var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var express = require('express');


var net = require('net');
var inquirer = require("inquirer");

app.use(express.static('www'));
var ngrok = require('ngrok');
var os = require('os');
var clients = [];
var clientesWeb=[];
var authtoken = '244QGUSZi9qchuMZzWkGJ_QqcXJRmqfbqCbDkZFvhU';

//var app = require('http').createServer(handler)
//var io = require('socket.io')(app);
//var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectID;

var url = 'mongodb://estacionebem:aplicativo@ds139715.mlab.com:39715/estacionebem';



server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


io.on('connection', function (socket) {
   clientesWeb.push(socket);

 // socket.emit('news', { hello: 'world' });
 // socket.on('my other event', function (data) {
 //   console.log(data);
 // });

});








// ------------------------------   IP Servidor  ------------------------------
// Esse código é só para mostrar o ip da sua máquina na rede local.
var interfaces = os.networkInterfaces();

for (var k in interfaces)
  for (var k2 in interfaces[k])
    if (interfaces[k][k2].family === 'IPv4' && !interfaces[k][k2].internal)
      console.log("\nIP local: %s", interfaces[k][k2].address);

// -------------------------------   Servidor   -------------------------------
var PORT =  process.env.PORT || 8080;
var IP =  process.env.IP || "0.0.0.0";

var server = net.createServer(function(socket) {
  // Qunado um cliente entra no servidor, salvamos ele na lista (data em UNIX)
  socket.date =  (new Date).getTime();

  // Adiciona ele na lista
  clients.push(socket);

  // Quando um clientes desconectar, tiramos ele da lista
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
  });

  // Quando um cliente manda uma informação
  socket.on('data', function (data) {
    var valor = parseInt(data.toString());
    if (Number.isInteger(valor)) {
      // Essa parte é onde você adiciona a inteligência
    clientesWeb.forEach(function (client) {
            client.emit('news', valor);
            console.log(valor);
          });
    }
  });
});

server.on('error', function(err){
  console.log(err);
});

/*
// Solucao alternativa
server.listen(PORT, function() {
  address = server.address();
  //console.log("\nServidor em %s\n", url);
  console.log('Informações sobre conexão: %j \n', server.address());
  pergunta();
});
*/

ngrok.connect({proto: 'tcp', addr: PORT, authtoken:authtoken}, function (err, url) {
  server.listen(PORT, function() {
    address = server.address();
    console.log("\nServidor em %s\n", url);
    pergunta();
  });
});


// -------------------------------     Menu     -------------------------------
var pergunta = function () {
  inquirer.prompt([{
    type: "list",
    name: "opcao",
    message: "O que você quer saber?",
    choices: [
      {"name": "Lista de clientes conectados.", "value": 1},
      {"name": "Número de clientes conectados.", "value": 2},
      {"name": "Desligar Servidor", "value": 3},
    ]
  }], function( answers ) {
    switch(answers.opcao) {
    case 2:
        console.log("\nExistem %s clientes conectados.\n", clients.length);
        break;
    case 3:
        process.exit();
        break;
    case 1:
        if (clients.length > 0) {
          var data_atual = (new Date).getTime();
          console.log("\nCliente \t\t\t Tempo Conexão");
          clients.forEach(function (client) {
            console.log("%s:%s \t\t %d s", client.remoteAddress, client.remotePort, (data_atual-client.date)/1000);
          });
          console.log("\n");
        } else {
          console.log("\nNão existem clientes conectados!\n");
        }
        break;
    default:
    }
    pergunta();
  });
}

app.get('/ocorrencias/listar', function(req, res) {
  MongoClient.connect(url, function(err, db) {
  
    db.collection('totens').find().toArray(function(err, results) {
         console.log("teste");
      // res.render('courses', { courses: results });
      //console.log(results);
      res.json(results);

      db.close();
    })

    db.addListener("error", function(error){
    console.log("Error connecting to MongoLab");
  });

  });

});