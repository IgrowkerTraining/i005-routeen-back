import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import Category from "@/models/Category";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {

      const { id } = await params; 
  
      
      await connect();
     
      if (!id) {
        return NextResponse.json({ message: "ID parameter is missing" }, { status: 400 });
      }
  

      const category = await Category.findById(id);
  
      if (!category) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }
  
      return NextResponse.json(category);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Error fetching category" }, { status: 500 });
    }
  }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {

        await connect();

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Category ID is required" },
                { status: 400 }
            );
        }

        const { newName } = await req.json();


        if (!newName) {
            return NextResponse.json(
                { message: "'newName' is required to update the category" },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { name: newName },
            { new: true }
        );

        if (!category) {
            return NextResponse.json(
                { message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: `Category with ID ${id} updated successfully`, category },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { message: "Failed to update category" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connect();

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Category ID is required" },
                { status: 400 }
            );
        }

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return NextResponse.json(
                { message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Category deleted successfully", category: deletedCategory },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { message: "Failed to delete category" },
            { status: 500 }
        );
    }
}