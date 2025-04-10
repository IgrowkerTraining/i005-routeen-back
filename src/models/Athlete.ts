import { Schema, InferSchemaType, model, models, Types } from "mongoose";
import Trainer from "./Trainer";
const { ObjectId } = Types;

const AthleteSchema = new Schema(
    {
        name: { type: "string", required: true },
        email: { type: "string", required: true, unique: true },
        phone: { type: "string", required: true },
        date_birth: { type: "string", required: true },
        goals: { type: "string", required: true },
        weight: { type: "string" },
        height: { type: "string" },
        gender: { type: "string" },
        injuries: { type: "string" },
        profile_picture_url: { type: "string" },
        profile_picture_id: { type: "string" },
        trainer_id: { type: ObjectId, ref: Trainer },
        role: { type: "string", default: "athlete" }
    },
    {
        timestamps: true
    }
)

const Athlete = models.Athlete || model("Athlete", AthleteSchema)

export type AthleteType = InferSchemaType<typeof AthleteSchema>;
export default Athlete