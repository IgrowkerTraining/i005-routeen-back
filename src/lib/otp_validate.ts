import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function otp_validate(code: string) {

    const user = await Student.findOne({ otp_code: code })
    if (!user) {
        return NextResponse.json({ message: "Student doesnt found" })
    }

    const date = new Date
    const otp_valid = isWithinOneMonth(date, user.otp_exp)

    if (otp_valid) {
        return true
    }

    return false
}

function isWithinOneMonth(date1: Date, date2: Date): boolean {
    const ONE_MONTH_IN_MS = 1000 * 60 * 60 * 24 * 30; // Aproximadamente 1 mes
    const diff = Math.abs(date2.getTime() - date1.getTime()); // diferencia en ms
    return diff <= ONE_MONTH_IN_MS;
}