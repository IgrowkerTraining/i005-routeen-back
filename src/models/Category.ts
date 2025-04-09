import { Schema, model, models, Types } from "mongoose";

const { ObjectId } = Types;

const CategorySchema = new Schema(
    {
        name: { type: "string", required: true },
        
    },
    {
        timestamps: true
    }
)

const Category = models.Category || model("Category", CategorySchema)

export default Category