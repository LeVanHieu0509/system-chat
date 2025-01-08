const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (socket) => {
  console.log('Client đã kết nối.');

  // Gửi dữ liệu qua stream
  const readStream = fs.createReadStream('example.txt', 'utf8');
  readStream.on('data', (chunk) => {
    socket.send(chunk);
  });

  socket.on('message', (message) => {
    console.log('Nhận được từ client:', message);
  });

  socket.on('close', () => {
    console.log('Client đã ngắt kết nối.');
  });
});

console.log('WebSocket server đang chạy trên cổng 8080.');
