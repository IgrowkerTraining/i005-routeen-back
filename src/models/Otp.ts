import { Schema, model, models, Types } from "mongoose";
import Athlete from "./Athlete";
const { ObjectId } = Types;

const OtpSchema = new Schema(
    {
        athlete_id: { type: ObjectId, ref: Athlete, required: true },
        otp_code: { type: String, required: true },
        otp_start_date: { type: Date, required: true },
        otp_end_date: { type: Date, required: true },
        active: { type: Boolean, default: true },
    },
    {
        timestamps: true
    }
)

const Otp = models.Otp || model("Otp", OtpSchema)

export default Otp