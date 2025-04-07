import { Schema, model, models, Types } from "mongoose";
import { unique } from "next/dist/build/utils";
import Trainer from "./Trainer";
const { ObjectId } = Types;

const StudentSchema = new Schema(
    {
        name: { type: "string", required: true },
        email: { type: "string", required: true, unique: true },
        code_otp: { type: "string", required: true },
        otp_exp: { type: Date, required: true },
        phone: { type: "string", required: true },
        date_birth: { type: "string", required: true },
        goals: { type: "string", required: true },
        weight: { type: "string", required: true },
        height: { type: "string", required: true },
        gender: { type: "string", required: true },
        injuries: { type: "string", required: true },
        trainer_id: { type: ObjectId, ref: Trainer },
    },
    {
        timestamps: true
    }
)

const Student = models.Student || model("Student", StudentSchema)

export default Student