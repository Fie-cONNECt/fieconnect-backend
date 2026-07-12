import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, required: true },
    link: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Notification = model('Notification', notificationSchema);
