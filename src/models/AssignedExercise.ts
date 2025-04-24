import { ObjectId } from "mongodb";
import { models, model, Schema } from "mongoose";
import Exercise from "./Exercise";

const AssignedExerciseSchema = new Schema(
  {
    order: { type: Number, required: true },
    reps: { type: Number },
    series: { type: Number },
    weight_kg: { type: Number },
    rest_time_s: { type: Number },
    assigned_routine_id: {
      type: ObjectId,
      ref: "RoutineAssigned",
      required: true,
    },
    exercise_id: { type: ObjectId, ref: Exercise, required: true },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const AssignedExercise =
  models.AssignedExercise || model("AssignedExercise", AssignedExerciseSchema);

export default AssignedExercise;
