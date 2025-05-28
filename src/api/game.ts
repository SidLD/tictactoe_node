import express from 'express';
import { verifyAdmin, verifyToken } from '../util/verify';
import {
  registerGame 
} from '../controller/gameController';

const gameAPI = express();

// Add game registration route
gameAPI.post('/register-game', registerGame);

export default gameAPI;
