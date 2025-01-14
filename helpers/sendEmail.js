require("dotenv").config();
const SGMail = require("@sendgrid/mail");

const { SG_API_KEY } = process.env;
SGMail.setApiKey(SG_API_KEY);

const sendMail = async (data) => {
  const email = {
    from: "bragardlin@gmail.com",
    ...data,
  };

  return new Promise((resolve, reject) => {
    SGMail.send(email)
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

module.exports = sendMail;
