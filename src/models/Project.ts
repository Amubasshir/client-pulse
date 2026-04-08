import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  clientName: string;
  platform: 'whatsapp' | 'fiverr' | 'upwork' | 'other';
  platformLink?: string;
  status: 'active' | 'on-hold' | 'completed';
  description?: string;
  assignedMembers: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: [true, 'name is required'] },
    clientName: { type: String, required: [true, 'clientName is required'] },
    platform: {
      type: String,
      enum: {
        values: ['whatsapp', 'fiverr', 'upwork', 'other'],
        message: 'platform must be whatsapp, fiverr, upwork, or other',
      },
      required: [true, 'platform is required'],
    },
    platformLink: { type: String },
    status: {
      type: String,
      enum: {
        values: ['active', 'on-hold', 'completed'],
        message: 'status must be active, on-hold, or completed',
      },
      default: 'active',
    },
    description: { type: String },
    assignedMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project ?? mongoose.model<IProject>('Project', ProjectSchema);
