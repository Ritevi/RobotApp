const nodemailer = require('nodemailer');

class mail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'cleora98@ethereal.email',
        pass: '991YRgXy9KEm44jePW',
      },
    });
  }
}

module.exports = mail;
