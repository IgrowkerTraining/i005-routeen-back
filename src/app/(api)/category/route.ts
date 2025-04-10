import { NextResponse } from "next/server"; 
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import Category from "@/models/Category";

export async function POST(req:Request) {
    try{
        await connect();
        
        const {name} = await req.json();

        if(!name ){
            return NextResponse.json(
                {message:"The name is obligatory"},
                { status: 400}
            );
        }
    const newCategory = await Category.create( {name});
    return NextResponse.json(
        { message: "Category created successfully", category: newCategory },
        {status:201} 
    );
    }catch(error:any){
        console.error("Error creating category");
        if (error instanceof MongooseError) {
            return NextResponse.json(
              { message: "Database Error"},
              { status: 500 }
            );
          }

          return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function GET() {
    try{
        await connect();
        const  categories = await Category.find();
        //console.log("CATEGORÍAS DESDE GET:", categories);

        return NextResponse.json(categories,{status:200});

    }catch(error:any){
        console.error("Error fetching categories:", error)
        return NextResponse.json({message:"Failed to fetch categories"}, {status:500})
    }
}


export async function DELETE(req: Request) {
    try{
        await connect();
        const { name } = await req.json();

        if(!name){
            return NextResponse.json(
                {message:"category name in required"},
                {status: 400}
            )
        }
        const category = await Category.findOneAndDelete({name});

        if(!category){
            return NextResponse.json(
                {message:"category not found"},
                {status: 404}
            )
        }
        return NextResponse.json(
            { message: `Category ${name} deleted successfully` },
            {status:200}
        )

    }catch(error:any){
        console.error("Error deleting category:",error)
        return NextResponse.json(
            {message:"Failed to delete"},
            {status:500}
        )
    }
}

export async function PATCH(req:Request) {
    try{
        await connect();
        const {name, newName} = await req.json();

        if(!name || !newName){
            return NextResponse.json(
                {message:"Both 'name' and 'newName are required"},
                {status: 400}
            )
        }
     const category = await Category.findOneAndUpdate(
        {name},
        {name : newName},
        {new: true}
     )
     if(!category){
        return NextResponse.json(
            {message:"category not found"},
            {status: 404}
        )
        }
     return NextResponse.json(
        { message: `Category updated successfully`, category },
        {status: 200}
    )
     
    }catch(error: any){
        console.error("error updating category:",error);
        return NextResponse.json(
            {message:"Failed to update category"},
            {status: 500}
        )

    }
    
}

