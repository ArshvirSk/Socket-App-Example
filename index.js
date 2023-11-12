const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const socketiofileupload = require("socketio-file-upload");
const fs = require("fs");
const io = new Server(server);

app.use(socketiofileupload.router);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + "/uploads"));

io.sockets.on("connection", (socket) => {
  var uploader = new socketiofileupload();
  uploader.dir = "uploads";
  uploader.listen(socket);

  // whenever socket.io successfully uploads the file to the server this automatically fires
  uploader.on("saved", (event) => {
    console.log(event);

    event.file.clientDetail.nameOfImage = event.file.name;
  });

  // when error takes place
  uploader.on("error", (event) => {
    console.log("Uploader error: ", event);
  });

  console.log("a user connected");

  socket.on("chat message", (msg) => {
    // console.log("message: " + msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    fs.readdir("uploads", (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(__dirname + "/uploads/" + file, (err) => {
          if (err) throw err;
        });
      }
    });
  });
});

server.listen(3000, () => {
  console.log("listening on 3000");
});
