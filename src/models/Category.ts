import { Schema, model, models, Types } from "mongoose";
import { unique } from "next/dist/build/utils";

const { ObjectId } = Types;

const CategorySchema = new Schema(
    {
        name: { type: String, required: true, unique:true },
        
    },
    {
        timestamps: true
    }
)

const Category = models.Category || model("Category", CategorySchema)

export default Category