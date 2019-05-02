const E2CToken = artifacts.require('./E2CToken.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(E2CToken, 'E2CToken', 'E2C', 10);
};
