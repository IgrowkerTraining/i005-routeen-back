import { Schema, model, models } from "mongoose";
import { unique } from "next/dist/build/utils";

const TrainerSchema = new Schema(
    {
        name: { type: "string", required: true },
        email: { type: "string", required: true, unique: true },
        password: { type: "string", required: true },
        phone: { type: "string", required: true },
        date_birth: { type: "string", required: true },

    },
    {
        timestamps: true
    }
)

const Trainer = models.Trainer || model("Trainer", TrainerSchema)

export default Trainer