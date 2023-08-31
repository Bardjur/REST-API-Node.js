const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { User } = require("../models/users");
require("dotenv").config();

const { DB_HOST_TEST } = process.env;
const userData = {
  email: "example@example.com",
  password: "examplepassword",
};

describe("login user test", () => {
  beforeAll(async () => {
    await mongoose
      .connect(DB_HOST_TEST)
      .then(() => console.log("DB Connected"))
      .catch((err) => {
        console.log(err);
      });

    await User.deleteMany();
  });

  it("user registered, have a status 201 and response data match", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send(userData);

    expect(response.statusCode).toBe(201);

    expect(response.body.email).toBe(userData.email);
  });

  it("the user logined, have a status 200 and token", async () => {
    const response = await request(app).post("/api/users/login").send(userData);

    expect(response.statusCode).toBe(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.token).not.toBe("");
    expect(response.body.token).not.toBeNull();
  });

  it("fake login - error 'Email or password is wrong' and status 400", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "example@example5.com",
      password: userData.password,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Email or password is wrong");
  });

  it("fake password - error 'Email or password is wrong' and status 400", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: userData.email,
      password: "examplepass",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Email or password is wrong");
  });

  afterAll(
    async () =>
      await mongoose
        .disconnect(DB_HOST_TEST)
        .then(() => console.log("disconnected"))
  );
});
