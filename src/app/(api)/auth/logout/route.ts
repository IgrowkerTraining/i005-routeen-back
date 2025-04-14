/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario (eliminar cookie con el token)
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       500:
 *         description: Error del servidor al cerrar sesión
 */

import { NextResponse } from "next/server";

export const POST = async () => {
    try {
        const res = NextResponse.json({ message: "Logout successful" });

        res.headers.set(
            "Set-Cookie",
            [
                `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
            ].join(", ")
        );

        return res;
    } catch (error: any) {
        return new NextResponse("Error during logout: " + error.message, {
            status: 500
        });
    }
};
