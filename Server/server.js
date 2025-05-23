const express = require("express");
require("dotenv").config();
require("./firebaseServices");

const app = express();
app.use(express.json());
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
app.use("/api/auth", authRouter);
