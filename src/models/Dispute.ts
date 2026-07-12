import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const disputeSchema = new Schema(
  {
    tenancy: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidenceUrl: { type: String },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN',
      required: true,
    },
    comments: [commentSchema],
    viewedByLandlordAt: { type: Date },
    viewedByTenantAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const Dispute = model('Dispute', disputeSchema);
