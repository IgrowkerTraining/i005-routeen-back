import { ObjectId } from "mongodb";
import { Schema, model, models } from "mongoose";
import Category from "./Category";

const ExerciseSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  img_url: { type: String },
  img_id: { type: String },
  category_id: { type: ObjectId, requierd: true, ref: Category },
});

const Exercise = models.Exercise || model("Exercise", ExerciseSchema);

export default Exercise;
