import {  Schema, model } from 'mongoose'
import bcrypt from 'bcrypt';
import { IFile } from './fileMode';

export type UserType = {
  _id?: string
  username: string
}

const userSchema = new Schema<UserType>(
  {
    username: { type: String, required: true , unique: true},

  },
  {
    timestamps: true,
  }
)


const User = model('User', userSchema)
export default User