import { Schema, model, models } from "mongoose";
import { unique } from "next/dist/build/utils";

const UserSchema = new Schema(
    {
        email: { type: "string", required: true, unique: true }
    },
    {
        timestamps: true
    }
)

const User = models.User || model("User", UserSchema)

export default User