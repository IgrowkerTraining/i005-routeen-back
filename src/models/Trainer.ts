import { InferSchemaType, Schema, model, models } from "mongoose";

const TrainerSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        date_birth: { type: String, required: true },
        role: { type: String, default: "trainer" },
        profile_picture_url: { type: String },
        profile_picture_id: { type: String },
    },
    {
        timestamps: true
    }
)

const Trainer = models.Trainer || model("Trainer", TrainerSchema)

export type TrainerType = InferSchemaType<typeof TrainerSchema>;
export default Trainer