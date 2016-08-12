var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');


var http = require('http');

// coisas do applicativo
var io = require('socket.io').listen(server);
var app = require('express')();

var server = require('http').Server(app);
var net = require('net');
var inquirer = require("inquirer");
var ngrok = require('ngrok');
var os = require('os');
var clients = [];
var clientesWeb=[];
var authtoken = '244QGUSZi9qchuMZzWkGJ_QqcXJRmqfbqCbDkZFvhU';

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectID;

var url = 'mongodb://estacionebem:aplicativo@ds139715.mlab.com:39715/estacionebem';




var express = require('express');
app.use(express.static('www'));


var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});


server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


// comecando coisas da conexao 
io.on('connection', function (socket) {
   clientesWeb.push(socket);
   console.log("ok no socket")
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


ngrok.connect({proto: 'tcp', addr: PORT, authtoken:authtoken}, function (err, url) {
  server.listen(PORT, function() {
    address = server.address();
    console.log("\nServidor em %s\n", url);
   // pergunta();
  });
});

// Isso aqui só copie e cola! Confia...
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


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