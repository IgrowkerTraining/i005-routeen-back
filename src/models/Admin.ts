import { InferSchemaType, Schema, model, models } from "mongoose";

const AdminSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "admin" }
    },
    {
        timestamps: true
    }
)

const Admin = models.Admin || model("Admin", AdminSchema)

export type AdminType = InferSchemaType<typeof AdminSchema>;
export default Admin