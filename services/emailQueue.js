const { Queue } = require("bullmq");
const dotenv = require("dotenv");

dotenv.config();

const connectionDetails = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

const emailQueue = new Queue("emailQueue", {
  connection: connectionDetails,
});

function addEmailJobInEmailQueue(emailData) {
  return emailQueue.add("sendEmail", emailData, {
    attempts: 3,
    backoff: 5000,
  });
}

module.exports = { addEmailJobInEmailQueue, emailQueue };
