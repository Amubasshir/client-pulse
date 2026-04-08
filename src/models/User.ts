import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'name is required'] },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, 'password is required'] },
    role: {
      type: String,
      enum: { values: ['admin', 'member'], message: 'role must be admin or member' },
      default: 'member',
    },
    avatar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);
