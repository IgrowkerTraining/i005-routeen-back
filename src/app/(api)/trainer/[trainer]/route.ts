import connect from "@/lib/db";
import Trainer, { TrainerType } from "@/models/Trainer";
import { NextResponse } from "next/server";
import validate from "@/lib/validate";

export async function GET(
    req: Request,
    { params }: { params: { trainer: string } }
) {
    try {
        console.log("params:", params);
        await connect();
        const trainer = await Trainer.findById(params.trainer);
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 400 });
        }
        return NextResponse.json(trainer, { status: 200 });
    } catch (error: any) {
        return new NextResponse("Error in fetching trainer: " + error.message, {
            status: 500,
        });
    }
}

export const PATCH = async (req: Request, { params }: { params: { trainer: string } }) => {
    try {
        await connect()
        const { name, email, phone, date_birth } = await req.json()

        const updates: Partial<TrainerType> = {};

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

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { message: "No valid fields provided to update." },
                { status: 400 }
            );
        }

        const trainer = await Trainer.findByIdAndUpdate(params.trainer, updates, {
            new: true,
            runValidators: true,
        });
        if (!trainer) {
            return NextResponse.json({ message: "Trainer not found" }, { status: 404 })
        }
        return NextResponse.json(trainer, { status: 200 })
    } catch (error: any) {

        return new NextResponse("Error in updating trainer" + error.message, {
            status: 400
        })
    }
}

// export const DELETE = async (req: Request, { params }: { params: { trainer: string } }) => {
//     try {
//         await connect()
//         const trainer = await Trainer.findByIdAndDelete(params.trainer)
//         if (!trainer) {
//             return NextResponse.json({ message: "Trainer not found" }, { status: 400 })
//         }
//         return NextResponse.json({ message: "Trainer deleted successfully" }, { status: 200 })
//     } catch (error: any) {
//         return new NextResponse("Error in deleting trainer" + error.message, {
//             status: 500
//         })
//     }
// }