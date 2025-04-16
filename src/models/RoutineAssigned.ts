import { Schema, InferSchemaType, model, models, Types } from "mongoose";
import Trainer from "./Trainer";
import Athlete from "./Athlete";
const { ObjectId } = Types;

const RoutineAssignedSchema = new Schema(
    {
        assignment_date: { type: "String", required: true },
        description: { type: "String"},
        trainer_id: { type: ObjectId, ref: "Trainer", required: true },
        athlete_id: { type: ObjectId, ref: "Athlete", required: true },
    },
    {
        timestamps: true
    }
)

const RoutineAssigned = models.RoutineAssigned || model("RoutineAssigned", RoutineAssignedSchema)

export type RoutineAssignedType = InferSchemaType<typeof RoutineAssignedSchema>;
export default RoutineAssigned