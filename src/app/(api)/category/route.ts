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