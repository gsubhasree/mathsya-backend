const fabricNetwork = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");

const AppUtil = require("./blockchain/AppUtil");
const CAUtil = require("./blockchain/CAUtil");

const channelName = "documentchannel";
const chaincodeId = "records";

const administrationConnectionProfile = AppUtil.buildCCPAdministration();
const administrationCA = CAUtil.buildCAClient(
  FabricCAServices,
  administrationConnectionProfile,
  "ca.administration.mathsya.tech"
);

const stakeholdersConnectionProfile = AppUtil.buildCCPStakeholders();
const stakeholdersCA = CAUtil.buildCAClient(
  FabricCAServices,
  stakeholdersConnectionProfile,
  "ca.stakeholders.mathsya.tech"
);

module.exports.enrollUser = async (email) => {
  const wallet = await AppUtil.buildWallet(
    fabricNetwork.Wallets,
    process.cwd() + "/stakeholders-wallet"
  );
  await CAUtil.enrollAdmin(stakeholdersCA, wallet, "StakeholdersMSP");
  return await CAUtil.registerAndEnrollUser(
    stakeholdersCA,
    wallet,
    "StakeholdersMSP",
    email,
    "stakeholders.user"
  );
};

module.exports.enrollAdministrator = async (email) => {
  const wallet = await AppUtil.buildWallet(
    fabricNetwork.Wallets,
    process.cwd() + "/administration-wallet"
  );
  await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
  return await CAUtil.registerAndEnrollUser(
    administrationCA,
    wallet,
    "AdministrationMSP",
    email,
    "administration.administrator"
  );
};

module.exports.enrollModerator = async (email) => {
  const wallet = await AppUtil.buildWallet(
    fabricNetwork.Wallets,
    process.cwd() + "/administration-wallet"
  );
  await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
  return await CAUtil.registerAndEnrollUser(
    administrationCA,
    wallet,
    "AdministrationMSP",
    email,
    "administration.moderator"
  );
};

const performTransaction = async (
  user,
  transactionName,
  transactionType,
  ...args
) => {
  let wallet = await AppUtil.buildWallet(
    fabricNetwork.Wallets,
    process.cwd() + "/stakeholders-wallet"
  );
  await CAUtil.enrollAdmin(stakeholdersCA, wallet, "StakeholdersMSP");
  await CAUtil.registerAndEnrollUser(
    stakeholdersCA,
    wallet,
    "StakeholdersMSP",
    user.email,
    "stakeholders.user"
  );

  const gatewayOptions = {
    identity: user.email,
    wallet,
  };
  const gateway = new fabricNetwork.Gateway();
  await gateway.connect(stakeholdersConnectionProfile, gatewayOptions);
  const network = await gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeId);
  let result;
  if (transactionType === "submit") {
    result = await contract.submitTransaction(transactionName, ...args);
  } else if (transactionType === "evaluate") {
    result = await contract.evaluateTransaction(transactionName, ...args);
  }
  console.log(
    `Transaction has been evaluated, result is: ${result.toString()}`
  );
  gateway.disconnect();
  return result;
};

module.exports.helloWorld = async (user) => {
  return await performTransaction(user, "helloWorld", "evaluate");
};

module.exports.addProduct = async (
  owner,
  { name, quantity, location, cost }
) => {
  return await performTransaction(
    owner,
    "createProduct",
    "submit",
    name,
    quantity.toString(),
    location,
    cost.toString(),
    JSON.stringify(owner)
  );
};

module.exports.getProductsOfOwner = async (owner) => {
  return await performTransaction(
    owner,
    "getOwnedProducts",
    "evaluate",
    JSON.stringify(owner)
  );
};

module.exports.getProduct = async (owner, productId) => {
  console.log("getProduct", owner, productId);
  return await performTransaction(
    owner,
    "readProduct",
    "evaluate",
    JSON.stringify(productId)
  );
};

module.exports.getProductOfOwnerHistory = async (owner) => {
  return await performTransaction(
    owner,
    "getHistoryProducts",
    "evaluate",
    JSON.stringify(owner)
  );
};

module.exports.sellProduct = async (owner, productId, { location, cost }) => {
  return await performTransaction(
    owner,
    "sellProduct",
    "submit",
    JSON.stringify(productId),
    location,
    cost.toString(),
    JSON.stringify(owner)
  );
};

module.exports.transferProduct = async (
  owner,
  productId,
  { location, cost }
) => {
  return await performTransaction(
    owner,
    "transferProduct",
    "submit",
    JSON.stringify(productId),
    location,
    cost.toString(),
    JSON.stringify(owner)
  );
};

module.exports.putProductInAuction = async (owner, productId) => {
  return await performTransaction(
    owner,
    "putProductInAuction",
    "submit",
    JSON.stringify(productId)
  );
};

module.exports.getProductsInAuction = async (owner) => {
  return await performTransaction(
    owner,
    "getInAuctionProducts",
    "evaluate",
    JSON.stringify(owner)
  );
};
