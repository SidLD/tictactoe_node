import { Schema, model, Document, Types } from 'mongoose';
import { UserType } from './userModel';

export type Cell = 'X' | 'O' | null;

export interface IGameDoc extends Document {
  _id: string;
  playerX: UserType;
  playerO: UserType;
  board: Cell[];
  turn: 'X' | 'O';
  winner: 'X' | 'O' | 'Draw' | null;
  status: 'playing' | 'draw' | 'won'
  winnerId: UserType | string;
  isFinished: boolean;
  logs: String[];
}

const gameSchema = new Schema<IGameDoc>(
  {
    playerX: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    playerO: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    board: {
      type: [String],
      default: Array(9).fill(null),
    },
    turn: { type: String, enum: ['X', 'O'], default: 'X' },
    winner: { type: String, enum: ['X', 'O', 'Draw', null], default: null },
    winnerId: { type: String },
    status: { type: String },
    isFinished: { type: Boolean, default: false },
    logs: [String],
  },
  { timestamps: true }
);

const Game = model<IGameDoc>('Game', gameSchema);
export default Game;
