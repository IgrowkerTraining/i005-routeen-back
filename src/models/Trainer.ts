import { InferSchemaType, Schema, model, models } from "mongoose";

const TrainerSchema = new Schema(
    {
        name: { type: "string", required: true },
        email: { type: "string", required: true, unique: true },
        password: { type: "string", required: true },
        phone: { type: "string", required: true },
        date_birth: { type: "string", required: true },
        role: { type: "string", default: "trainer" }
    },
    {
        timestamps: true
    }
)

const Trainer = models.Trainer || model("Trainer", TrainerSchema)

export type TrainerType = InferSchemaType<typeof TrainerSchema>;
export default Trainer