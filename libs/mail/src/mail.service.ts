import { Logger } from '@nestjs/common';
import { default as sendgrid } from '@sendgrid/mail';
import {
  SENDGRID_ACCOUNT_INFO,
  SENDGRID_API_KEY,
  SENDGRID_FG_PASS_LINK,
  SENDGRID_FG_PASS_SUBJECT,
  SENDGRID_OTP_SUBJECT,
  SENDGRID_RESET_PASSCODE,
  SENDGRID_SENDER,
} from 'libs/config';
import { OTPTemplate } from './template/otp';

export class MailService {
  private readonly _logger = new Logger('MailService');
  private static _instance: MailService;

  constructor() {
    sendgrid.setApiKey(SENDGRID_API_KEY);
  }

  static getInstance() {
    if (this._instance) return this._instance;
    this._instance = new MailService();
    Object.freeze(this._instance);
    return this._instance;
  }

  sendOTP(to: string, otp: string | number, ttl = 5) {
    const { html } = new OTPTemplate();

    this.sendMail(to, html, SENDGRID_OTP_SUBJECT, {
      code: otp as string,
      ttl: `${ttl}`,
    });
  }

  sendForgotPass(to: string, token: string) {
    const html = `<h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to reset your password</h1>
            <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                We cannot simply send you your old password. To reset your password, click the
                following link and follow the instructions.
            </p>
            <a href="${SENDGRID_FG_PASS_LINK}${token}&email=${to}"
            target="_blank" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">
            Reset Password </a>`;

    this.sendMail(to, html, SENDGRID_FG_PASS_SUBJECT);
  }

  sendResetPasscode(to: string, passcode: string) {
    const html = `<h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to reset your passcode</h1>
            <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
            <p>Your new passcode is ${passcode}</p>`;

    this.sendMail(to, html, SENDGRID_RESET_PASSCODE);
  }

  sendInfoAccount(to: string, phone: string, passcode: string) {
    const html = `<div style="color:#1e1e2d; font-family:'Rubik',sans-serif; text-align: center;"><h1 style=" font-weight:500; margin:0;font-size:25px;">You have been created a new account on Bitback - BLOCKCHAIN EWALLET.</h1>
            <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
            <p style="margin:30;font-size:22px;">Account information is: <p>Phone:${phone}</p><p>Passcode:${passcode}</p></p>
            <p style="margin:30;font-size:22px;">Login to use and get more details</p></div>`;

    this.sendMail(to, html, SENDGRID_ACCOUNT_INFO);
  }

  private sendMail(
    to: string,
    html: string,
    subject: string,
    substitutions?: { [key: string]: string },
  ) {
    this._logger.log(`${subject} - invoked - email: ${to}`);
    // sendgrid.send({ from: SENDGRID_SENDER, subject, to, html, substitutions });
  }
}
