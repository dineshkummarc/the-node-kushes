
http_server = express.createServer();

http_server.configure(function() {
  http_server.use(express.methodOverride());
  http_server.use(express.bodyDecoder());
  http_server.use(http_server.router);
  http_server.set('views', __dirname + '/client');
  http_server.use(express.staticProvider(__dirname + '/static'));
});

// app.configure('development', function(){
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });
// 
// app.configure('production', function(){
//   app.use(express.errorHandler());
// });

poorsman_mongodb = {
  'voting_rooms': {},
  'connected_clients': {}
}

create_random_id = function(len) {
  var id = '', i = Math.ceil(len/2);
  with(Math) while(i--) 
    id += (floor(random()*(256-15))+15).toString(16);
  return id.substr(0, len);
}

http_server.register('.html', require('ejs'));
http_server.set('view options', {'layout': false});

http_server.get('/', function(req, res) {
  res.render('index.html', {'locals': {'times': 10}});
});

http_server.get('/voting-room/:id', function(req, res) {
  if(!poorsman_mongodb.voting_rooms[req.params.id]) {
    res.redirect('/');
    return;
  }
  res.render('voting-room.html', {'locals': {'voting_room_id': req.params.id}});
});

http_server.post('/voting-room', function(req, res) {
  var voting_room_data = JSON.parse(decodeURIComponent(req.body.voting_room_data));
  var voting_room_id = create_random_id(10);
  while(poorsman_mongodb.voting_rooms[voting_room_id])
    voting_room_id = create_random_id(10);
  var vr = poorsman_mongodb.voting_rooms[voting_room_id] = voting_room_data;
  vr.voting_room_id = voting_room_id;
  res.redirect('/voting-room/' + voting_room_id);
});

http_server.listen(80);

socket_server = io.listen(http_server);

socket_server.on('connection', function(client) {
  poorsman_mongodb.connected_clients[client.sessionId] = {};
  client.on('message', function(message) {
    var voting_room_id = message.voting_room_id;
    poorsman_mongodb.connected_clients[client.sessionId] = message;
    if(message.pick) {
      if(poorsman_mongodb.voting_rooms[voting_room_id][message.pick] == undefined) {
        poorsman_mongodb.voting_rooms[voting_room_id][message.pick] = 0;
      }
      poorsman_mongodb.voting_rooms[voting_room_id][message.pick]++; 
    }
    console.log('poorsman_mongodb.voting_rooms[voting_room_id]: ' + poorsman_mongodb.voting_rooms[voting_room_id]);
    client.broadcast({'omg': 1});  
  });
  client.on('disconnect', function() {
    var message = poorsman_mongodb.connected_clients[client.sessionId];
    var voting_room_id = message.voting_room_id;
    if(message.pick) {
      poorsman_mongodb.voting_rooms[voting_room_id][message.pick]--;
    }
    client.broadcast(poorsman_mongodb.voting_rooms[voting_room_id]);
  });
});
