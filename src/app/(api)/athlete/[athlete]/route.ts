import { NextResponse } from "next/server";
import Athlete, { AthleteType } from "@/models/Athlete";
import connect from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadToCloudinary";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { v2 as cloudinary } from 'cloudinary';
import validate from "@/lib/validate";

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
            folder: "AthleteProfilePicture",
        });

        if (existingUser.profile_picture_id) {
            await cloudinary.uploader.destroy(existingUser.profile_picture_id);
        }

        const updateUser = await Athlete.findByIdAndUpdate(user.id, {
            profile_picture_url: result.secure_url,
            profile_picture_id: result.public_id,
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

export async function GET(
    req: Request,
    { params }: { params: { athlete: string } }
) {
    try {
        await connect();
        const athlete = await Athlete.findById(params.athlete);
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 400 });
        }
        return NextResponse.json(athlete, { status: 200 });
    } catch (error: any) {
        return new NextResponse("Error in fetching athlete: " + error.message, {
            status: 500,
        });
    }
}

export const PATCH = async (req: Request, { params }: { params: { trainer: string } }) => {
    try {
        await connect()
        const {
            name,
            email,
            phone,
            date_birth,
            goals,
            weight,
            height,
            gender,
            injuries,
        } = await req.json();

        const updates: Partial<AthleteType> = {};
        //TODO modificar validaciones
        if (name !== undefined && name !== null && name.trim() !== "") {
            validate.isValidName(name);
            updates.name = name;
        }

        if (email !== undefined && email !== null && email.trim() !== "") {
            validate.isValidEmail(email);
            updates.email = email;
        }

        if (phone !== undefined && phone !== null && phone.trim() !== "") {
            validate.isValidPhone(phone);
            updates.phone = phone;
        }

        if (date_birth !== undefined && date_birth !== null && date_birth.trim() !== "") {
            validate.isValidDate(date_birth);
            updates.date_birth = date_birth;
        }

        if (goals !== undefined && goals !== null && goals.trim() !== "") {
            validate.isValidString(goals, "Goals");
            updates.goals = goals;
        }

        if (weight !== undefined && weight !== null && weight.trim() !== "") {
            validate.isValidString(weight, "Weight");
            updates.weight = weight;
        }

        if (height !== undefined && height !== null && height.trim() !== "") {
            validate.isValidString(height, "Height");
            updates.height = height;
        }

        if (gender !== undefined && gender !== null && gender.trim() !== "") {
            validate.isValidString(gender, "Gender");
            updates.gender = gender;
        }

        if (injuries !== undefined && injuries !== null && injuries.trim() !== "") {
            validate.isValidString(injuries, "Injuries");
            updates.injuries = injuries;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { message: "No valid fields provided to update." },
                { status: 400 }
            );
        }

        const athlete = await Athlete.findByIdAndUpdate(params.trainer, updates, {
            new: true,
            runValidators: true,
        });
        if (!athlete) {
            return NextResponse.json({ message: "Athlete not found" }, { status: 404 })
        }
        return NextResponse.json(athlete, { status: 200 })
    } catch (error: any) {

        return new NextResponse("Error in updating athlete" + error.message, {
            status: 400
        })
    }
}