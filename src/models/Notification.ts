import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  memberName: string;
  memberId: Types.ObjectId;
  projectName: string;
  projectId: Types.ObjectId;
  action: 'created' | 'edited';
  updateId: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    memberName: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectName: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    action: { type: String, enum: ['created', 'edited'], required: true },
    updateId: { type: Schema.Types.ObjectId, ref: 'Update', required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.models.Notification ??
  mongoose.model<INotification>('Notification', NotificationSchema);
