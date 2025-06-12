const express = require("express");
require("dotenv").config();
require("./firebaseServices");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;

const startServer = async () => {
  try {
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.log(error.message);
  }
};

app.listen(port, startServer);

app.get("/", (req, res) => {
  res.send("Server is working!");
});

const authRouter = require("./routes/authentication");
const categoryRouter = require("./routes/category");
const transactionRouter = require("./routes/transaction");

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/transactions", transactionRouter);
