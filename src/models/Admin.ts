import { InferSchemaType, Schema, model, models } from "mongoose";

const AdminSchema = new Schema(
    {
        email: { type: "string", required: true, unique: true },
        password: { type: "string", required: true },
        role: { type: "string", default: "admin" }
    },
    {
        timestamps: true
    }
)

const Admin = models.Admin || model("Admin", AdminSchema)

export type AdminType = InferSchemaType<typeof AdminSchema>;
export default Admin