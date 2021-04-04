const nodemailer = require('nodemailer');
const config = require('../../config');

class mail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'sanekv1999@gmail.com',
        clientId: config.get('ClientIdGmail'),
        clientSecret: config.get('ClientSecretGmail'),
        refreshToken: config.get('RefreshTokenGmail'),
        accessToken: config.get('AccessTokenGmail'),
        expires: 1484314697598,
      },
    });
  }

  async sendEmail(email, text, html, subject = 'RobotApp') {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail({
        from: 'sanekv1999@gmail.com', // sender address
        to: email, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
      }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async getLink(UUID) {
    const link = `http:${config.get('host')}:${config.get('port')}/auth/activateProfile/${UUID}`;
    return link;
  }

  async registerEmail(email, UUID) {
    const link = await this.getLink(UUID);
    const text = `Confirm your email address if you have registered\n${link}`;
    return this.sendEmail(email, text, `<h1><a>${text}</a></h1>`);
  }
}

module.exports = mail;
