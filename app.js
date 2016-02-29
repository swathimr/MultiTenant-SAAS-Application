var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var sdlc = require('./routes/sdlc');
var app = express();
//var async= require('async');
var connection  = require('express-myconnection'); 
var mysql = require('mysql');
var login = require('./routes/user');
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}
/*------------------------------------------
    connection peer, register as middleware
    type koneksi : single,pool and request 
-------------------------------------------*/
app.use(
    
    connection(mysql,{
        
        host: 'localhost',
        user: 'team3',
        //password : 'root',
        port : 3306, //port mysql
        database:'multi_tenant_db',
        multipleStatements: true
    },'request')
);//route index, hello world


app.get('/', routes.index);//route customer list
app.post('/login/auth', login.authenticate);//route customer list
app.post('/register',login.register);

app.get('/sdlc', sdlc.list);
app.get('/sdlc/edit/:id', sdlc.edit);
app.post('/sdlc/save_edit/:id', sdlc.save_edit);
app.get('/sdlc/stats_kanban', sdlc.stats_kanban);
app.post('/sdlc/scrumChart',sdlc.scrumChart);



app.use(app.router);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});