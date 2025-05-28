import express from 'express';
import { verifyToken } from '../util/verify';
import {
  addMoveToGame,
  getGameHistory,
  getGameStatus,
  getPlayersStatus,
  registerGame, 
  resetGame
} from '../controller/gameController';

const gameAPI = express();

gameAPI.post('/register-game', registerGame);
gameAPI.get('/player-details', verifyToken, getPlayersStatus);
gameAPI.put('/player-move', verifyToken, addMoveToGame);
gameAPI.post('/reset-game', verifyToken, resetGame);
gameAPI.get('/game-status', verifyToken, getGameStatus);
gameAPI.get('/game-history', getGameHistory);

export default gameAPI;
