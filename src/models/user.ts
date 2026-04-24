import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  avatar?: string;
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  googleId?: string;
  role: "student" | "freelancer" | "employer";
  // الحقل المشترك (مسمى وظيفي للطالب / تخصص الشركة لصاحب العمل)
  professionalTitle: string;
  location: string;
  bio: string;
  about?: string; // (About Me للطالب / About Us للشركة)
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    mostaql?: string;
    khamsat?: string;
  };
  // حقول خاصة بالطالب
  featuredProjects?: Array<{
    title: string;
    description: string;
    link: string;
  }>;
  // حقول خاصة بصاحب العمل
  targetTalents?: string[];
  status: "online" | "offline" | "busy";
  notificationSettings?: {
    chatMessages: boolean;
    mentions: boolean;
    jobAlerts: boolean;
    sounds: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (
    candidatePassword: string,
    userPassword: string,
  ) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [
        function (this: any) {
          return !this.googleId;
        },
        "Phone number is required",
      ],
      unique: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [
        function (this: any) {
          return !this.googleId;
        },
        "Password is required",
      ],
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: ["student", "freelancer", "employer"],
      default: "student",
      required: [true, "User role is required"],
    },
    // تم تغيير المسمى من trackName ليكون أشمل
    professionalTitle: {
      type: String,
      required: [true, "Professional title or specialization is required"],
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
      trim: true,
    },
    about: {
      type: String,
      trim: true,
      default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    socialLinks: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      mostaql: { type: String, trim: true, default: "" },
      khamsat: { type: String, trim: true, default: "" },
    },
    // حقول إضافية للطالب
    featuredProjects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        link: { type: String, trim: true },
      },
    ],
    // حقول إضافية لصاحب العمل
    targetTalents: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline",
    },
    notificationSettings: {
      chatMessages: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true },
      sounds: { type: Boolean, default: true },
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// تحديث الفهارس (Indexes) لتسريع البحث بالمسمى الجديد
UserSchema.index({ fullName: 1 });
UserSchema.index({ skills: 1 });
UserSchema.index({ professionalTitle: 1 });

UserSchema.pre("save", async function (this: any) {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model<IUser>("User", UserSchema);
