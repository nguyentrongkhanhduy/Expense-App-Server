const cron = require("node-cron");
const {
  sendWeeklySummaries,
  sendMonthlySummaries,
} = require("./controllers/transactionController");

cron.schedule(
  "02 23 * * 4",
  () => {
    console.log("Running weekly summary task...");
    sendWeeklySummaries();
  },
  {
    timezone: "America/Toronto",
  }
);

cron.schedule(
  "0 8 1 * *",
  () => {
    console.log("Running monthly summary task...");
    sendMonthlySummaries();
  },
  {
    timezone: "America/Toronto",
  }
);
