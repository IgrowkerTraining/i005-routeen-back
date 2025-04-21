'use client';
// @ts-ignore
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
    return (
        <main style={{ height: '100vh', width: '100%' }}>
            <SwaggerUI url="/docs/json" />
        </main>
    );
}
