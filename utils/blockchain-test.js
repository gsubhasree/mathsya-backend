const blockchain = require("./blockchain");
require("dotenv").config();

const rand = Math.floor(Math.random() * 10000);

const user = { email: `user${rand}@stakeholders.mathsya.tech` };

const green = "\x1b[32m";
const clear = "\x1b[0m";

const approveTestFlow = async () => {
  // (await blockchain.helloWorld(user)).toString();
  // (
  //   await blockchain.addProduct(user, {
  //     name: "Test Product",
  //     quantity: 10,
  //     cost: 100,
  //     location: "Test Location",
  //   })
  // ).toString();
  // (await blockchain.getProductsOfOwner(user)).toString();
  (await blockchain.getProduct(user, 2)).toString();
  // (await blockchain.getProductOfOwnerHistory(user)).toString();
  // (
  //   await blockchain.sellProduct(
  //     user,
  //     1,
  //     {
  //       location: "Test Location",
  //       cost: 100,
  //     }
  //   )
  // ).toString();
};

const rejectTestFlow = async () => {};

const runTestFlow = async () => {
  console.log(`${green}Running test flow...${clear}`);
  await approveTestFlow();
  console.log(`${green}Approve test flow completed successfully${clear}`);
  await rejectTestFlow();
  console.log(`${green}Reject test flow completed successfully${clear}`);
};

runTestFlow().then(() => {
  console.log(`${green}Test flow completed successfully${clear}`);
});
