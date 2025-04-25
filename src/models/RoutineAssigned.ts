import { Schema, InferSchemaType, model, models, Types } from "mongoose";
import Routine from "./Routine";
import Athlete from "./Athlete";
const { ObjectId } = Types;

const RoutineAssignedSchema = new Schema(
    {
        assignment_date: { type: Date },
        description: { type: String },
        routine_id: { type: ObjectId, ref: Routine, required: true },
        athlete_id: { type: ObjectId, ref: Athlete, required: true },
        completed: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
)

const RoutineAssigned = models.RoutineAssigned || model("RoutineAssigned", RoutineAssignedSchema)

export type RoutineAssignedType = InferSchemaType<typeof RoutineAssignedSchema>;
export default RoutineAssigned