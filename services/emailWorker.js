const { Worker } = require("bullmq");
const mail = require("./mailService");
const { emailQueue } = require("./emailQueue");

require("dotenv").config({ path: "../.env" });

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { receiver, generatedToken } = job.data;

    try {
      console.log("Started the Job to mail ", receiver);
      const emailStatus = await mail(receiver, generatedToken);
      console.log(`Email sent successfully: ${emailStatus.messageId}`);
    } catch (error) {
      console.error(`Failed to send email: ${error}`);
      throw error;
    }
  },
  {
    connection: emailQueue.opts.connection,
  }
);

worker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} has been completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job with ID ${job.id} has failed with error ${err.message}`);
});
