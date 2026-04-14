import mongoose, { Schema, Types } from "mongoose";


// the workshop will be a place where people can interact and learn
// it will be indpendent of the shop and it will be orcestrated by 
// instrcutor of the workshop

const workshopSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    valid : {
        type : Boolean ,
        required : true,
        default: false  // Requires admin validation
    },
    validationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: { type: String, default: null },
    category: { type: String, default: null },
    tags: [{ type: String }],
    description: { type: String, required: true },
    content: { type: String, default: null },
    gallery: [
      {
        _id: false,
        url: { type: String, required: true },
        caption: { type: String, default: null },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["online" , "in-person"],
        default: "online",
      },
      venueName: { type: String, default: null },
      addressLine1: { type: String, default: null },
      addressLine2: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      postalCode: { type: String, default: null },
      country: { type: String, default: "DZ" },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
      meetingLink: { type: String, default: null },
    },
    schedule: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      timezone: { type: String, default: "Africa/Algiers" },
    },
    price: {
      required : true ,
      type : Number ,
      min : 0
    },
    capacity: {
      maxSeats: { type: Number, default: null },
      seatsTaken: { type: Number, default: 0 },
    },
    resources: [{ type: String }],
    agenda: [
      {
        _id: false,
        title: { type: String, required: true },
        description: { type: String, default: null },
        scheduledAt: { type: Date, default: null },
      },
    ],
    instructor: {
        _id : false ,
        name: { type: String, required: true },
        bio: { type: String, default: null },
        avatar: { type: String, default: null },
        userId: { type: Types.ObjectId, ref: "User" },
    },
    applicationRequired: { type: Boolean, default: false },
    applications: [
      {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        motivation: { type: String, default: null },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: Date.now },
    lastModifiedBy: { type: Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Workshop = mongoose.model("Workshop", workshopSchema);

export default Workshop;
