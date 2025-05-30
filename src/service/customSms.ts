import CONFIG from "../config/vars";
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport(CONFIG.email.smtp);
/* istanbul ignore next */
if (CONFIG.env !== 'test') {
	transport
		.verify()
		.then(() => console.log('Connected to email server'))
		.catch(() => console.log(
			// eslint-disable-next-line max-len
			'Unable to connect to email server. Make sure you have configured the SMTP options in .env')
		);
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to: string, subject: string, text: string): Promise<any> => {
	const msg = { from: CONFIG.email.from, to, subject, text };
	await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to: string, token: string): Promise<any> => {
	const subject = 'Reset password';
	// replace this url with the link to the reset password page of your front-end app
	const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
	const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
	await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to: string, token: string): Promise<any> => {
	const subject = 'Email Verification';
	// replace this url with the link to the email verification page of your front-end app
	const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
	const text = `Dear user,
    To verify your email, click on this link: ${verificationEmailUrl}
    If you did not create an account, then ignore this email.`;
	await sendEmail(to, subject, text);
};

module.exports = {
	transport,
	sendEmail,
	sendResetPasswordEmail,
	sendVerificationEmail,
};
