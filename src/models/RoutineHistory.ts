import { Schema, InferSchemaType, model, models, Types } from "mongoose";
const { ObjectId } = Types;

const RoutineHistorySchema = new Schema(
    {
        name: { type: "String", required: true },
        description: { type: "String"},
        athlete_id: { type: ObjectId, ref: "Athlete", required: true },
        assigned_routine_id: { type: ObjectId, ref: "RoutineAssigned", required: true },
    },
    {
        timestamps: true
    }
)

const RoutineHistory = models.RoutineHistory || model("RoutineHistory", RoutineHistorySchema)

export type RoutineHistoryType = InferSchemaType<typeof RoutineHistorySchema>;
export default RoutineHistory