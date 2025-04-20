import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Tu API con Swagger",
    version: "1.0.0",
    description: "Documentación de tu API",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
  components: {
    schemas: {
      OtpValidation: {
        type: "object",
        properties: {
          otp_code: {
            type: "string",
            example: "123456",
          },
        },
        required: ["otp_code"],
      },
      Athlete: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          date_birth: { type: "string" },
          goals: { type: "string" },
          weight: { type: "string" },
          height: { type: "string" },
          gender: { type: "string" },
          injuries: { type: "string" },
          trainer_id: { type: "string" },
          profile_picture_url: { type: "string" },
          profile_picture_id: { type: "string" },
        },
        required: [
          "name",
          "email",
          "phone",
          "date_birth",
          "goals",
          "trainer_id",
        ],
      },
      Trainer: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
          phone: { type: "string" },
          date_birth: { type: "string" },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
          profile_picture_url: { type: "string" },
          profile_picture_id: { type: "string" },
        },
        required: ["name", "email", "password", "phone", "date_birth"],
      },
      Otp: {
        type: "object",
        properties: {
          athlete_id: { type: "string" },
          otp_code: { type: "string" },
          otp_start_date: { type: "string" },
          otp_end_date: { type: "string" },
          active: { type: "boolean" },
        },
        required: ["athlete_id", "otp_code", "otp_start_date", "otp_end_date"],
      },
      SendOtp: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
          },
          athlete_id: {
            type: 'string',
          },
        },
        required: ['phoneNumber', 'athlete_id'],
      },
      Admin: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
          role: { type: "string" },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
        required: ["email", "password"],
      },
      Exercise: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          img_url: { type: "string" },
          img_id: { type: "string" },
          category_id: { type: "string" },
        },
        required: ["name", "category_id"],
      },

      RoutineExercise: {
        type: "object",
        properties: {
          order: {
            type: "number",
            example: 1,
          },
          reps: {
            type: "number",
            example: 12,
          },
          series: {
            type: "number",
            example: 3,
          },
          weight_kg: {
            type: "number",
            example: 20,
          },
          rest_time_s: {
            type: "number",
            example: 60,
          },
          exercise_id: {
            type: "string",
            example: "661e44169aa304a9e269a0e4",
          },
          routine_id: {
            type: "string",
            example: "661e44679aa304a9e269a0eb",
          },
        },
        required: ["order", "exercise_id", "routine_id"],
      },

    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["src/app/(api)/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
