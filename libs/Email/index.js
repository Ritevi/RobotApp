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

  async sendEmail(email, text, html = '<h1>Hi ksta</h1>', subject = 'RobotApp') {
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
}

module.exports = mail;
