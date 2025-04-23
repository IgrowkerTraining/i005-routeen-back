import { ObjectId } from "mongodb";
import { Schema, model, models } from "mongoose";
import Category from "./Category";

const ExerciseSchema = new Schema({
  name: { type: String, required: true, unique: true },
  img_url: { type: String },
  img_id: { type: String },
  video_id: { type: String },
  video_url: { type: String },
  category_id: { type: ObjectId, required: true, ref: Category },
});

const Exercise = models.Exercise || model("Exercise", ExerciseSchema);

export default Exercise;
