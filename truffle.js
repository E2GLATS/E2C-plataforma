// var HDWalletProvider = require('truffle-hdwallet-provider');
// var infura_apikey = '';
// var mnemonic = '';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          'https://ropsten.infura.io/' + infura_apikey,
        ),
      network_id: 3,
    },
  },
  compilers: {
    solc: {
        version: "0.5.2"
    }
  }
};
