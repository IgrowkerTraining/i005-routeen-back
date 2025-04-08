import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Tu API con Swagger',
        version: '1.0.0',
        description: 'Documentación de tu API',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
    ],
    components: {
        schemas: {
            OtpValidation: {
                type: 'object',
                properties: {
                    otp_code: {
                        type: 'string',
                        example: '123456',
                    },
                },
                required: ['otp_code'],
            },
            Athlete: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    date_birth: { type: 'string' },
                    goals: { type: 'string' },
                    weight: { type: 'string' },
                    height: { type: 'string' },
                    gender: { type: 'string' },
                    injuries: { type: 'string' },
                    trainer_id: { type: 'string', description: 'ID del entrenador' },
                },
                required: [
                    'name', 'email', 'phone', 'date_birth',
                    'goals', 'weight', 'height', 'gender',
                    'injuries', 'trainer_id'
                ],
            },
        },
    },
};


const options = {
    swaggerDefinition,
    apis: ['src/app/(api)/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);