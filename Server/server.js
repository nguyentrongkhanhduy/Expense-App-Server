const express = require("express");
require("dotenv").config();
require("./firebaseServices");
require("./scheduler")

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is working!");
});

const authRouter = require("./routes/authentication");
const categoryRouter = require("./routes/category");
const transactionRouter = require("./routes/transaction");

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/transactions", transactionRouter);

// Only start the server locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Export the app for Vercel
module.exports = app;