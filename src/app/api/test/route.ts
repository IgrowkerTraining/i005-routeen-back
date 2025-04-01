import { NextResponse } from "next/server";
import connect from "@/lib/db";

export async function GET() {
    try {
        await connect();
        return NextResponse.json({ message: "✅ MongoDB conectado correctamente" });
    } catch (error) {
        return NextResponse.json({ error: "❌ Error al conectar a Mongo" }, { status: 500 });
    }
}
