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
                    trainer_id: { type: 'string' },
                    profile_picture_url: { type: "string" },
                    profile_picture_id: { type: "string" },
                },
                required: [
                    'name', 'email', 'phone', 'date_birth',
                    'goals', 'trainer_id'
                ],
            },
            Trainer: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    phone: { type: 'string' },
                    date_birth: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    profile_picture_url: { type: "string" },
                    profile_picture_id: { type: "string" },
                },
                required: ['name', 'email', 'password', 'phone', 'date_birth'],
            },
            Otp: {
                type: 'object',
                properties: {
                    athlete_id: { type: 'string' },
                    otp_code: { type: 'string' },
                    otp_start_date: { type: 'string' },
                    otp_end_date: { type: 'string' },
                    active: { type: 'boolean' }
                },
                required: ['athlete_id', 'otp_code', 'otp_start_date', 'otp_end_date']
            }
        },
    },
}

const options = {
    swaggerDefinition,
    apis: ['src/app/(api)/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);