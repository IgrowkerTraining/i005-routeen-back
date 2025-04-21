import { ObjectId } from "mongodb";
import { models, model, Schema } from "mongoose";
import Exercise from "./Exercise";
import Routine from "./Routine";

const RoutineExerciseSchema = new Schema({
  order: { type: Number, required: true },
  reps: { type: Number },
  series: { type: Number },
  weight_kg: { type: Number },
  rest_time_s: { type: Number },
  exercise_id: { type: ObjectId, required: true, ref: Exercise },
  routine_id: { type: ObjectId, required: true, ref: Routine },
});

const RoutineExercise =
  models.RoutineExercise || model("RoutineExercise", RoutineExerciseSchema);

export default RoutineExercise;
