import { NextResponse } from "next/server";

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?\d{8,15}$/;
const DATE_REGEX = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

function isValidName(name: string) {
    if (!NAME_REGEX.test(name)) {
        throw new Error("Invalid name format. Name must contain only letters, spaces, and hyphens.")
    }
}

function isValidPassword(password: string) {
    if (!PASSWORD_REGEX.test(password)) {
        throw new Error("Invalid password format. Password must be at least 8 characters long and contain at least one letter, one number, and one special character.")
    }
}

function isValidEmail(email: string) {
    if (!EMAIL_REGEX.test(email)) {
        throw new Error("Invalid email format. Please provide a valid email address.")
    }
}

function isValidPhone(phone: string) {
    if (!PHONE_REGEX.test(phone)) {
        throw new Error("Invalid phone format. Phone number must be between 8 and 15 digits long and may start with a '+' sign.")
    }
}

function isValidDate(date: string) {
    if (!DATE_REGEX.test(date)) {
        throw new Error("Invalid date format. Date must be in the format DD/MM/YYYY.")
    }
}

const validate = {
    isValidName,
    isValidPassword,
    isValidEmail,
    isValidPhone,
    isValidDate
}

export default validate

