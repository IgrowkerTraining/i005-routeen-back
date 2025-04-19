import { ObjectId } from "mongodb";
import { models, model, Schema } from "mongoose";
import RoutineAssigned from "./RoutineAssigned";
import Exercise from "./Exercise";

const AssignedExerciseSchema = new Schema(
  {
    queue: { type: Number, required: true },
    reps: { type: Number },
    sets: { type: Number },
    routine_weight: { type: Number },
    rest_time: { type: Number },
    assigned_routine_id: {
      type: ObjectId,
      ref: RoutineAssigned,
      required: true,
    },
    exercise_id: { type: ObjectId, ref: Exercise, required: true },
  },
  {
    timestamps: true,
  }
);

const AssignedExercise =
  models.AssignedExercise || model("AssignedExercise", AssignedExerciseSchema);

export default AssignedExercise;
