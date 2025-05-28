import User from '../models/userModel';
import { IGameDoc } from '../models/gameModel';
import jwt from 'jsonwebtoken';
import { createGameForUsers, findGameForUsers } from '../service/gameService';
import CONFIG from '../config/vars';

export const registerGame = async (req: any, res: any) => {
  const { playerXName, playerOName } = req.body;

  if (!playerXName || !playerOName) {
    return res.status(400).json({ message: 'Both player names are required' });
  }

  try {
    let playerX = await User.findOne({ username: playerXName });
    if (!playerX) {
      playerX = await User.create({ username: playerXName });
    }

    let playerO = await User.findOne({ username: playerOName });
    if (!playerO) {
      playerO = await User.create({ username: playerOName });
    }

    let game: IGameDoc | null = await findGameForUsers(playerXName, playerOName);
    if(!game){
      game = await createGameForUsers(playerX._id, playerO._id);
    }

      const gameToken = jwt.sign(
      {
        gameId: game._id,
        players: [
          { id: playerX._id, username: playerX.username, role: 'X' },
          { id: playerO._id, username: playerO.username, role: 'O' },
        ],
      },
      CONFIG.JWT_SECRET,
      { expiresIn: '21h' }
    );
    return res.status(201).json({
      message: 'New game created',
      gameId: game._id,
      turn: game.turn,
      board: game.board,
      logs: game.logs,
      token: gameToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register game', error });
  }
};
