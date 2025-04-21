export function generateOTP() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = Array.from({ length: 3 }, () =>
        letters.charAt(Math.floor(Math.random() * letters.length))
    ).join('');

    const raw = Math.floor(Math.random() * 1000);
    const number = raw.toString().padStart(3, '0');

    const code = prefix + number;

    const otp_end_date = new Date();
    otp_end_date.setMonth(otp_end_date.getMonth() + 1);

    return { code, otp_end_date };
}
