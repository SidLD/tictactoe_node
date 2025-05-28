import express from 'express';
import bodyParser from 'body-parser';
import gameAPI from './api/game';
import { createServer } from 'http'; 
import { emitNotification, initializeSocket } from './service/customSocket';
import VARS from './config/vars';
import connectDB from './config/db';
import notificatioAPI from './api/notification';
import cors from 'cors';

const app = express();
const server = createServer(app);


// Initialize Socket.IO
initializeSocket(server);
const port = VARS.PORT;
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json(), urlencodedParser);

const allowedOrigins = [
  VARS.CLIENT_URI, VARS.SERVER_URI
];
const corsOptions = {
  origin: function (origin:any, callback:any) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // only if you're using cookies or auth headers
};
console.log(allowedOrigins)
app.use(cors(corsOptions));
// ****************   START OF API     ****************
app.use(gameAPI)
app.use('/notifications', notificatioAPI)
// ****************   END OF API     ****************


// ****************   START OF DB CONNECTION     ****************
connectDB()
// ****************   END OF DB CONNECTION     ****************

setTimeout(() => {
  emitNotification({})
}, 5000)
// Start the server
server.listen(port, () => {
  console.log(`-> Ready on http://localhost:${port}`);
});
