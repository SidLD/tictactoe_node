
import mongoose, { Schema, model } from "mongoose";
import { UserType } from "./userModel";


export interface Inotification {
  _id: string | undefined;
  to: UserType; 
  from: UserType; 
  path: string;
  title: string;
  description: string;
  isRead: boolean;
}

// Notification Schema
const notificationSchema = new Schema<Inotification>(
    {
        to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        description: String,
        title: String,
        from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        path: String,
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
      timestamps: true, // Automatically manage timestamps
    }
  );
  
  // Export the User model
  export default model<Inotification>("Notification", notificationSchema);