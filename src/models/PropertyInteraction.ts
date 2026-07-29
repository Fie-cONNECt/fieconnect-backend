import { Schema, model } from 'mongoose';

/**
 * Implicit and explicit tenant–listing interactions for recommendations.
 * Weights (applied at scoring time with time decay):
 * APPLY 1.0 | SAVE 0.7 | VIEW_LONG 0.35 | VIEW 0.15 | UNSAVE -0.4
 */
const propertyInteractionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    type: {
      type: String,
      enum: ['VIEW', 'VIEW_LONG', 'SAVE', 'UNSAVE', 'APPLY', 'REJECT_OUTCOME'],
      required: true,
    },
    /** Optional dwell time in seconds for VIEW / VIEW_LONG */
    durationSec: { type: Number, default: null },
  },
  { timestamps: true },
);

propertyInteractionSchema.index({ user: 1, property: 1, type: 1, createdAt: -1 });
propertyInteractionSchema.index({ createdAt: -1 });

export const PropertyInteraction = model('PropertyInteraction', propertyInteractionSchema);

export const INTERACTION_WEIGHTS: Record<string, number> = {
  APPLY: 1.0,
  SAVE: 0.7,
  VIEW_LONG: 0.35,
  VIEW: 0.15,
  UNSAVE: -0.4,
  REJECT_OUTCOME: -0.55,
};
