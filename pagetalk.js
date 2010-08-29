
app = express.createServer();

app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyDecoder());
  app.use(app.router);
  app.set('views', __dirname + '/client');
  app.use(express.staticProvider(__dirname + '/static'));
});

// app.configure('development', function(){
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });
// 
// app.configure('production', function(){
//   app.use(express.errorHandler());
// });

app.register('.html', require('ejs'));
app.set('view options', {'layout': false});

app.get('/', function(req, res){
  res.render('index.html', {'locals': {'times': 10}});
});

app.listen(3000);

// boilerplate
app_boiler = express.createServer();

app_boiler.get('/', function(req, res){
    res.send('git.init();<br><br>while (true) {<br>&nbsp;&nbsp;git.commit();<br>}');
});

//app.listen(3000);
app_boiler.listen(80)
