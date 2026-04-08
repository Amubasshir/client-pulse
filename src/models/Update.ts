import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUpdateContent {
  todayWork: string;
  tomorrowPlan: string;
  blockers?: string;
  notes?: string;
}

export interface IUpdate extends Document {
  project: Types.ObjectId;
  author: Types.ObjectId;
  content: IUpdateContent;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UpdateSchema = new Schema<IUpdate>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'project is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'author is required'],
    },
    content: {
      todayWork: { type: String, required: [true, 'todayWork is required'] },
      tomorrowPlan: { type: String, required: [true, 'tomorrowPlan is required'] },
      blockers: { type: String },
      notes: { type: String },
    },
    date: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default mongoose.models.Update ?? mongoose.model<IUpdate>('Update', UpdateSchema);
