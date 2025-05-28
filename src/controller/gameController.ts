import User from '../models/userModel';
import Game, { IGameDoc } from '../models/gameModel';
import jwt from 'jsonwebtoken';
import { checkWinner, createGameForUsers, findGameForUsers } from '../service/gameService';
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
      game = await createGameForUsers(playerX.username, playerO.username);
    }
    if(game){
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
    }else{
      res.status(500).json({ message: 'Failed to register game', game });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Failed to register game', error });
  }
};

export const getPlayersStatus = async (req: any, res: any) => {
  const { playerX, playerO } = req.game.players;
  if (!playerX || !playerO) {
    return res.status(404).json({ message: 'One or both users not found' });
  }
  console.log({ playerX, playerO })
  try {

    const winX = await Game.countDocuments({
      winnerId: playerX.id,
      status: 'won',
      isFinished: true
    });

    const winO = await Game.countDocuments({
      winnerId: playerO.id,
      status: 'won',
      isFinished: true
    });

    const drawsX = await Game.countDocuments({
      playerX: playerX.id,
      status: 'draw',
      isFinished: true
    });

    const drawsO = await Game.countDocuments({
      playerO: playerO.id,
      status: 'draw',
      isFinished: true
    });

   return res.status(200).json({
        stats: {
          [playerX.username]: { wins: winX, draws: drawsX },
          [playerO.username]: { wins: winO, draws: drawsO }
        }
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal error', error });
  }
};

export const addMoveToGame = async (req: any, res: any) => {
  const gameId = req.game._id;
  const { index, symbol } = req.body;

  if (typeof index !== 'number' || !['X', 'O'].includes(symbol)) {
    return res.status(400).json({ message: 'Invalid move input' });
  }

  const { playerX, playerO } = req.game.players;

  try {
    const game = await Game.findById(gameId);

    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (game.isFinished) return res.status(400).json({ message: 'Game already finished' });
    if (game.board[index] !== null) return res.status(400).json({ message: 'Cell already occupied' });
    if (game.turn !== symbol) return res.status(400).json({ message: `It's not ${symbol}'s turn` });

    game.board[index] = symbol;
    game.logs.push(`${symbol} played on cell ${index + 1}`);

    const winner = checkWinner(game.board, playerX, playerO);

    if (winner) {
      game.winner = symbol ; 
      game.winnerId = symbol == 'X' ? playerX.id : playerO.id
      game.isFinished = true;
      game.status = 'won';
      game.logs.push(`${winner.username} wins the game`);
    } else if (!game.board.includes(null)) {
      game.winner = null;
      game.isFinished = true;
      game.status = 'draw';
      game.logs.push('Game ended in a draw');
    } else {
      game.turn = symbol === 'X' ? 'O' : 'X';
    }

    await game.save();

    return res.status(200).json({
      message: 'Move registered',
      board: game.board,
      winner: winner ? winner.username : null,
      turn: game.turn,
      logs: game.logs,
      isFinished: game.isFinished
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getGameStatus = async (req: any, res: any) => {
  const gameId = req.game._id;

  try {
    const game:IGameDoc | null = await Game.findById(gameId).populate('playerX playerO');

    if (!game) return res.status(404).json({ message: 'Game not found' });
    const { playerX, playerO } = game;
     const winner = checkWinner(
      game.board,
      { id: playerX._id!.toString(), username: playerX.username },
      { id: playerO._id!.toString(), username: playerO.username }
    );
    return res.status(200).json({
      board: game.board,
      winner: winner ? winner : null,
      turn: game.turn,
      logs: game.logs,
      status: game.status,
      playerO: game.playerO,
      playerX: game.playerX,
      isFinished: game.isFinished,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const resetGame = async (req: any, res: any) => {
  const gameId = req.game._id;

  try {
    const game = await Game.findById(gameId);

    if (!game) return res.status(404).json({ message: 'Game not found' });

    game.board = Array(9).fill(null);
    game.turn = 'X'; 
    game.winner = null;
    game.isFinished = false;
    game.status = 'playing';
    game.logs.push('Game reset');

    await game.save();

    return res.status(200).json({
      message: 'Game has been reset',
      board: game.board,
      winner: null,
      turn: game.turn,
      logs: game.logs,
      isFinished: game.isFinished,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getGameHistory = async (req: any, res: any) => {
  try {
    const games = await Game.find({ isFinished: true })
      .populate('playerX playerO')
      .sort({ updatedAt: -1 }); // optional: latest first

    const history = games.map((game) => {
      const { playerX, playerO, board } = game;
      const winner = checkWinner(
        board,
        { id: playerX._id!.toString(), username: playerX.username },
        { id: playerO._id!.toString(), username: playerO.username }
      );

      return {
        _id: game._id,
        playerX: {
          id: playerX._id,
          username: playerX.username,
        },
        playerO: {
          id: playerO._id,
          username: playerO.username,
        },
        winner: winner
          ? winner
          : game.status === 'draw'
          ? 'Draw'
          : 'Won', 
        status: game.status,
        board: game.board,
      };
    });

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching game history:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
