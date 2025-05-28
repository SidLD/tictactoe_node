import Game, { IGameDoc } from '../models/gameModel';
import User from '../models/userModel';

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]


export const findGameForUsers = async (usernameX: string, usernameO: string) => {
  const playerX = await User.findOne({ username: usernameX });
  const playerO = await User.findOne({ username: usernameO });

  if (!playerX || !playerO) return null;

  const game = await Game.findOne({
    $or: [
      { playerX: playerX._id, playerO: playerO._id },
      { playerX: playerO._id, playerO: playerX._id },
    ],
    isFinished: false
  });

  return game;
};

export const createGameForUsers = async (usernameX: string, usernameO: string) => {
 try {
    let playerX = await User.findOne({ username: usernameX });
    let playerO = await User.findOne({ username: usernameO });

    if(playerO && playerX){
        const newGame = await Game.create({
          playerX: playerX._id,
          playerO: playerO._id,
          board: Array(9).fill(null),
          turn: 'X',
          logs: [`Game started between ${playerX.username} (X) and ${playerO.username} (O)`],
          isFinished: false,
          winner: null,
        });
      return newGame as IGameDoc;
    }else{
      return null;
    }
 } catch (error) {
    console.log(error)
    return null;
 }

};

export const checkWinner = (
  board: (string | null)[],
  playerX: { id: string; username: string },
  playerO: { id: string; username: string }
): { id: string; username: string } | null => {

  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      const symbol = board[a]
      return symbol === 'X' ? playerX : playerO
    }
  }

  return null
}
