import { Schema, InferSchemaType, model, models, Types } from "mongoose";
import Trainer from "./Trainer";
const { ObjectId } = Types;

const RoutineSchema = new Schema(
    {
        name: { type: "String", required: true },
        description: { type: "String"},
        trainer_id: { type: ObjectId, ref: "Trainer", required: true },
    },
    {
        timestamps: true
    }
)

const Routine = models.Routine || model("Routine", RoutineSchema)

export type RoutineType = InferSchemaType<typeof RoutineSchema>;
export default Routine

