import { Schema, InferSchemaType, model, models, Types } from "mongoose";
import Trainer from "./Trainer";
const { ObjectId } = Types;

const AthleteSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true,
            set:(value:string)=>{
                if(!value.startsWith("whatsapp:")){
                    const cleaned = value.replace(/\s+/g, '');
                    const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

                    return `whatsapp:${withPlus}`
                }
                return value
            }
         },
        date_birth: { type: String, required: true },
        goals: { type: String, required: true },
        weight: { type: String },
        height: { type: String },
        gender: { type: String },
        injuries: { type: String },
        profile_picture_url: { type: String },
        profile_picture_id: { type: String },
        trainer_id: { type: ObjectId, ref: Trainer, required: true },
        role: { type: String, default: "athlete" }
    },
    {
        timestamps: true
    }
)

const Athlete = models.Athlete || model("Athlete", AthleteSchema)

export type AthleteType = InferSchemaType<typeof AthleteSchema>;
export default Athlete