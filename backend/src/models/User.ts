import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  eventsCreated: mongoose.Types.ObjectId[];
  eventsJoined: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  eventsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  eventsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

export default mongoose.model<IUser>('User', UserSchema);
