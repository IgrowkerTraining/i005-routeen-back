import { Types } from "mongoose";
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?\d{8,15}$/;
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const OTP_REGEX = /^[A-Z]{3}[0-9]{3}$/
const WEIGHT_REGEX = /^[0-9]+(\.[0-9]+)?$/;
const HEIGHT_REGEX = /^[0-9]+(\.[0-9]+)?$/;

const { ObjectId } = Types

function isValidObjectId(id: string) {
    if (typeof id !== 'string' || !ObjectId.isValid(id)) {
        throw new Error("Invalid ObjectId format.")
    }
}

function isValidOTP(otp: string) {
    if (typeof otp !== 'string' || !OTP_REGEX.test(otp)) {
        throw new Error("Invalid OTP format. OTP must be in the format XXX000, where X is a letter and 0 is a digit.")
    }
}

function isValidName(name: string) {
    if (typeof name !== 'string' || !NAME_REGEX.test(name)) {
        throw new Error("Invalid name format. Name must contain only letters, spaces, and hyphens.")
    }
}


function isValidPassword(password: string) {
    if (typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
        throw new Error("Invalid password format. Password must be at least 8 characters long and contain at least one letter, one number, and one special character.")
    }
}

function isValidEmail(email: string) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
        throw new Error("Invalid email format. Please provide a valid email address.")
    }
}

function isValidPhone(phone: string) {
    if (typeof phone !== 'string' || !PHONE_REGEX.test(phone)) {
        throw new Error("Invalid phone format. Phone number must be between 8 and 15 digits long and may start with a '+' sign.")
    }
}

function isValidDate(date: string) {
    if (typeof date !== "string" || !DATE_REGEX.test(date)) {
        throw new Error("Invalid date format. Date must be in the format YYYY-MM-DD.");
    }
}

function isValidNumber(value: any) {
    if (typeof value !== "number" || isNaN(value)) {
        throw new Error("Invalid number. Value must be a valid number.");
    }
}

export function isValidString(value: any, fieldName: string) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`${fieldName} is required and must be a non-empty string.`);
    }
}

function isValidWeight(weight: string) {
    if (typeof weight !== 'string' || !WEIGHT_REGEX.test(weight)) {
        throw new Error("Invalid weight format. Weight must be a valid number.");
    }

    const weightValue = parseFloat(weight);
    if (weightValue < 40 || weightValue > 300) {
        throw new Error("Weight must be between 40 and 300.");
    }
}

function isValidHeight(height: string) {
    if (typeof height !== 'string' || !HEIGHT_REGEX.test(height)) {
        throw new Error("Invalid height format. Height must be a valid number.");
    }

    const heightValue = parseFloat(height);
    if (heightValue < 55 || heightValue > 250) {
        throw new Error("Height must be between 55 and 250 cm.");
    }
}

function isValidGender(gender: string) {
    gender = gender.toLowerCase();

    if (gender !== "hombre" && gender !== "mujer" && gender !== "otro") {
        throw new Error("Invalid gender format. Gender must be either 'hombre', 'mujer' or 'otro'.");
    }
}

function isValidDescription(description: string) {
    if (description && description.trim().split(/\s+/).length > 200) {
        throw new Error("Description should not exceed 200 words.");
    }
}

const validate = {
    isValidObjectId,
    isValidName,
    isValidPassword,
    isValidEmail,
    isValidPhone,
    isValidDate,
    isValidOTP,
    isValidString,
    isValidWeight,
    isValidHeight,
    isValidGender,
    isValidDescription,
    isValidNumber
}

export default validate