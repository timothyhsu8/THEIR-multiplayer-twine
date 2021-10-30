const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./server/UserSchema');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(bodyParser.json({limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())

const router = require('./server/router.js')
app.use('/api', router)

const CONNECTION_URL = 'mongodb+srv://timhsu:7xvPjvAEI3jMuhhf@users.xnee2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5000;

const users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket event for someone new connecting to the server
io.on('connection', (socket) => {
  if(!users[socket.id]){
    users[socket.id] = [socket.id, " has entered the server"];
    
    // Socket event for user entering the server
    io.sockets.emit('entered', users);
    
    // Socket event for user going somewhere
    socket.on('go somewhere', function(users) {
      io.sockets.emit('go somewhere', users);
    })


    // Connection to MongoDB
    mongoose.connect(CONNECTION_URL, { useNewUrlparser: true, useUnifiedTopology: true })
    
    // Save user to database
    let newUser = new User({ name: socket.id, location: "PlaceUpdated" })
    // newUser.save()
    // .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    // .catch((error) => console.log(error.message))
  }
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});