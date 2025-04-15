import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type JwtPayload = {
    id: string;
    role: string;
    name?: string;
};

export async function getCurrentUser(): Promise<JwtPayload> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        console.log("Token recibido desde las cookies:", token);  // Borrar al terminar verificación

        if (!token) {
            throw new Error("Token not found");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        return {
            id: decoded.id,
            role: decoded.role,
            name: decoded.name,
        };
    } catch (error: any) {
        throw new Error("Error in fetching user: " + error.message);
    }
}
