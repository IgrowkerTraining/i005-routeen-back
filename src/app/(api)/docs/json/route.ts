import { swaggerSpec } from '@/lib/swagger/swaggerOptions';
import { NextResponse } from 'next/server';

export const GET = () => {
    const json = JSON.stringify(swaggerSpec);
    return new NextResponse(json, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
