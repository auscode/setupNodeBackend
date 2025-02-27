const mongoose = require("mongoose");
const { Schema } = mongoose;

const experienceSchema = new Schema({
  companyName: { type: String, required: true }, // Name of the company
  role: { type: String, required: true }, // Role or position held
  duration: { type: String }, // Duration of employment
  description: { type: String }, // Description of the role or responsibilities
  employmentType: { type: String, default: "Full-time" },
  location: { type: String }, 
  startDate: { type: String },
  endDate: { type: String }, 
});

const educationSchema = new Schema({
  institutionName: { type: String, required: true }, // Name of the educational institution
  degree: { type: String, required: true }, // Degree or qualification obtained
  yearOfCompletion: { type: String }, // Year of completion of the degree
  fieldOfStudy: { type: String },
  location: { type: String }, 
  startDate: { type: String }, 
  endDate: { type: String }, 
});

const languageSchema = new Schema({
  languageName: { type: String, required: true }, // Name of the language
  proficiencyLevel: { type: String }, // Proficiency level in the language (e.g., Beginner, Intermediate, Fluent)
});

const personalProjectSchema = new Schema({
  projectName: { type: String, required: true }, 
  description: { type: String, required: true }, 
  startDate: { type: String, required: true }, 
  endDate: { type: String }, 
  technologies: [String], 
  isOngoing: { type: Boolean, default: false },
});

const userDetailsSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String }, // First name of the user
    lastName: { type: String }, // Last name of the user
    address: { type: String }, // Address of the user
    city: { type: String }, // City of the user
    pincode: { type: String }, // Pincode of the user's location
    country: { type: String }, // Country of the user
    title: { type: String }, // Title or designation of the user
    experience: [experienceSchema], // Array of experience objects
    education: [educationSchema], // Array of education objects
    skills: [String], // Array of skills (strings)
    languages: [languageSchema], // Array of language objects
    profileDescription: { type: String }, // Description of the user's profile
    hourlyRate: { type: Number }, // Hourly rate of the user
    phoneNumber: { type: String }, // Contact number of the user
    profileImage: { type: String },
    personalProjects: [personalProjectSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserDetails", userDetailsSchema);
