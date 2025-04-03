export function generateOTP(name: string) {

    const prefix = name.trim().slice(0, 3).toUpperCase();
    const raw = Math.floor(Math.random() * 1000);
    const number = raw.toString().padStart(3, '0')

    const code = prefix + number

    const otp_exp = new Date()
    otp_exp.setMinutes(otp_exp.getMonth() + 1)

    return { code, otp_exp }
}