import { ObjectId } from "mongodb";
import { models, model, Schema } from "mongoose";
import Exercise from "./Exercise";
import Routine from "./Routine";
import Athlete from "./Athlete";

const ExerciseHistorySchema = new Schema({
    athlete_id: { type: ObjectId, required: true, ref: Athlete },
    exercise_id: { type: ObjectId, required: true, ref: Exercise },
    // exercise_assigned_id: { type: ObjectId, required: true, ref: Exercise },
    order: { type: Number, required: true },
    reps: { type: Number },
    series: { type: Number },
    weight_kg: { type: Number },
    rest_time_s: { type: Number },
});

const ExerciseHistory =
    models.ExerciseHistory || model("ExerciseHistory", ExerciseHistorySchema);

export default ExerciseHistory;
