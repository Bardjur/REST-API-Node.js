const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
require("dotenv").config();

const { DB_HOST } = process.env;

describe("login user test", () => {
  beforeAll(async () => {
    await mongoose
      .connect(DB_HOST)
      .then(() => console.log("DB Connected"))
      .catch((err) => {
        console.log(err);
      });
  });

  it("the user logined, have a status 200 and token", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "example@example1.com",
      password: "examplepassword",
    });

    expect(response.statusCode).toBe(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.token).not.toBe("");
    expect(response.body.token).not.toBeNull();
  });

  it("fake login - error 'Email or password is wrong' and status 400", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "example@example5.com",
      password: "examplepassword",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Email or password is wrong");
  });

  it("fake password - error 'Email or password is wrong' and status 400", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "example@example.com",
      password: "examplepass",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Email or password is wrong");
  });
});
