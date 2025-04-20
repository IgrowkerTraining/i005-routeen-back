import { Schema, model, models, Types } from "mongoose";
import Athlete from "./Athlete";

const { ObjectId } = Types;

const WeightHistorySchema = new Schema(
    {
        athlete_id: { type: ObjectId, ref: Athlete, required: true },
        date: { type: String, required: true },
        weight: { type: String, required: true },
    },
)

const WeightHistory = models.WeightHistory || model("WeightHistory", WeightHistorySchema)

export default WeightHistory