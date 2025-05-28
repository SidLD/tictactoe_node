import Game from '../models/gameModel';
import User from '../models/userModel';

export const findGameForUsers = async (usernameX: string, usernameO: string) => {
  const playerX = await User.findOne({ username: usernameX });
  const playerO = await User.findOne({ username: usernameO });

  if (!playerX || !playerO) return null;

  const game = await Game.findOne({
    $or: [
      { playerX: playerX._id, playerO: playerO._id },
      { playerX: playerO._id, playerO: playerX._id },
    ]
  });

  return game;
};

export const createGameForUsers = async (usernameX: string, usernameO: string) => {
  let playerX = await User.findOne({ username: usernameX });
  let playerO = await User.findOne({ username: usernameO });

  if (!playerX) playerX = await User.create({ username: usernameX });
  if (!playerO) playerO = await User.create({ username: usernameO });

  const newGame = await Game.create({
    playerX: playerX._id,
    playerO: playerO._id,
    board: Array(9).fill(null),
    turn: 'X',
    logs: [`Game started between ${playerX.username} (X) and ${playerO.username} (O)`],
    isFinished: false,
    winner: null,
  });

  return newGame;
};
