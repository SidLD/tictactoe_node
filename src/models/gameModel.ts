import { Schema, model, Document, Types } from 'mongoose';

export type Cell = 'X' | 'O' | null;

interface ActionLog {
  index: number;
  symbol: 'X' | 'O';
  player: Types.ObjectId;
  timestamp: Date;
}

export interface IGameDoc extends Document {
  _id: string;
  playerX: Types.ObjectId;
  playerO: Types.ObjectId;
  board: Cell[];
  turn: 'X' | 'O';
  winner: 'X' | 'O' | 'Draw' | null;
  isFinished: boolean;
  logs: ActionLog[];
}

const actionLogSchema = new Schema<ActionLog>(
  {
    index: { type: Number, required: true },
    symbol: { type: String, enum: ['X', 'O'], required: true },
    player: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    isFinished: { type: Boolean, default: false },
    logs: [actionLogSchema],
  },
  { timestamps: true }
);

const Game = model<IGameDoc>('Game', gameSchema);
export default Game;
