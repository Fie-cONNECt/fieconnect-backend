import { Schema, model } from 'mongoose';

const applicationSchema = new Schema(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nationalIdUrl: { type: String, required: true },
    supportingDocsUrl: { type: String },
    employerName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    monthlyIncome: { type: String, required: true },
    lengthOfEmployment: { type: String, required: true },
    personalStatement: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'INFORMATION_REQUESTED',
        'APPROVED_PENDING_SIGNATURE',
      ],
      default: 'PENDING',
      required: true,
    },
    furtherDetailsRequest: { type: String },
    furtherDetailsResponse: { type: String },
    agreementUrl: { type: String },
    signedAgreementUrl: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Application = model('Application', applicationSchema);
