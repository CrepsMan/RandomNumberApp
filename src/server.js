const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const port = 3000;
const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const filePath = path.join(__dirname, "randomNumbers.txt");

let currentNumbers = "";

function generateRandomNumbers() {
  let numbers = [];
  for (let i = 0; i < 5; i++) {
    numbers.push(Math.floor(Math.random() * 100) + 1);
  }
  return numbers.join(" ");
}
function updateAndBroadcast() {
  currentNumbers = generateRandomNumbers();
  fs.writeFile(filePath, currentNumbers, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("Updated randomNumbers.txt with:", currentNumbers);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(currentNumbers);
      }
    });
  });
}

wss.on("connection", (ws) => {
  if (currentNumbers) {
    ws.send(currentNumbers);
  }
});

updateAndBroadcast();
setInterval(updateAndBroadcast, 10000);

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
