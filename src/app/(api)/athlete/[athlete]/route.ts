import { NextResponse } from "next/server";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadToCloudinary";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request, { params }: { params: { athlete: string } }) {
    try {
        await connect()
        const athleteId = params.athlete
        const user = await getCurrentUser()
        const data = await req.formData();
        const file = data.get("file") as File;

        if (user.id !== athleteId) {
            return NextResponse.json({ error: "You are not allow to do this change" }, { status: 403 });
        }

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 400 });
        }

        const existingUser = await Athlete.findById(user.id);
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const result = await uploadToCloudinary(file, {
            folder: "User",
        });

        const updateUser = await Athlete.findByIdAndUpdate(user.id, {
            profile_picture: result.secure_url,
        })

        if (!updateUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "File uploaded successfully",
            url: result.secure_url,
        }, { status: 201 })

    } catch (error: any) {

        return NextResponse.json({ message: "There was an error updating a profile picture" + error.message }, { status: 500 })
    }
}