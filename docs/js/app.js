App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.

    // TODO: Tirar esse coment
    // if (typeof web3 !== 'undefined') {
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // set the provider you want from Web3.providers
    //   App.web3Provider = new Web3.providers.HttpProvider(
    //     'http://localhost:8545',
    //   );
    //   web3 = new Web3(App.web3Provider);
    // }

    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    web3 = new Web3(App.web3Provider);

    $('#loading').hide();
    $('#system').show();

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('js/E2CToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var E2CTokenArtifact = data;
      App.contracts.E2CToken = TruffleContract(E2CTokenArtifact);

      // Set the provider for our contract.
      App.contracts.E2CToken.setProvider(App.web3Provider);

      // App.populateActions();

      App.updateUserData();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#addToWhitelist', App.addToWhitelist);
    $(document).on('click', '#addAction', App.createAction);
    $(document).on('click', '#addVolunteer', App.addVolunteer);
    $(document).on('click', '#finishAction', App.finishAction);
    $(document).on('click', '#mint', App.mint);
    $(document).on('click', '#createAccount', App.createAccount);
    $(document).on('click', '#checkAccount', App.checkAccount);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    if (
      document.getElementById('TTTransferAddress').value &&
      document.getElementById('TTTransferAmount').value
    ) {
      $('#loading').show();
      $('#system').hide();

      var e2cTokenInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.error(error);
        }

        var account = accounts[0];

        App.contracts.E2CToken.deployed()
          .then(async function(instance) {
            e2cTokenInstance = instance;

            const decimals = await e2cTokenInstance.decimals.call();
            const amount = parseInt($('#TTTransferAmount').val()) * Math.pow(10, decimals);
            const toAddress = $('#TTTransferAddress').val();

            // console.log('Transfer ' + $('#TTTransferAmount').val() + ' TT to ' + toAddress);

            return e2cTokenInstance.transfer(toAddress, amount, {
              from: account,
              gas: 100000,
            });
          })
          .then(function(result) {
            alert('Transferência Completa!');

            document.getElementById('TTTransferAddress').value = '';
            document.getElementById('TTTransferAmount').value = '';

            $('#loading').hide();
            $('#system').show();

            App.updateUserData();
          })
          .catch(function(err) {
            $('#loading').hide();
            $('#system').show();
            alert(err.message);
            console.error(err.message);
          });
      });
    }
  },

  getBalances: function(account) {
    // console.log('Getting balances...');

    var e2cTokenInstance;
    return new Promise(function(resolve, reject) {
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.error(error);
          reject(error);
        }

        if (!account) account = accounts[0];

        App.contracts.E2CToken.deployed()
          .then(async function(instance) {
            e2cTokenInstance = instance;
            return e2cTokenInstance.balanceOf(account);
          })
          .then(async function(result) {
            const decimals = await e2cTokenInstance.decimals.call();
            let balance = result / Math.pow(10, decimals);

            resolve(balance);
          })
          .catch(function(err) {
            console.error(err.message);
            reject(err);
          });
      });
    });
  },

  updateUserData: function() {
    App.getBalances().then(function(balance) {
      $('#TTBalance').text(balance);
    });
    App.getRecognitionFlow().then(function(flow) {
      $('#recognitionFlow').text(flow);
    });
    App.getTransferFlow().then(function(flow) {
      $('#transferFlow').text(flow);
    });
  },

  amITheOwner: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.error(error);
      }

      var account = accounts[0];

      App.contracts.E2CToken.deployed().then(function(instance) {
        e2cTokenInstance = instance;

        e2cTokenInstance.owner.then(function(result) {
          return result.toString() == account;
        });
      });
    });
  },

  mint: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.error(error);
      }

      $('#loading').show();
      $('#system').hide();

      var account = accounts[0];


      App.contracts.E2CToken.deployed().then(async function(instance) {
        e2cTokenInstance = instance;

        const decimals = await e2cTokenInstance.decimals.call({ from: account });
        const address = $('#address').val();
        const amount = parseInt($('#amount').val()) * Math.pow(10, decimals);
        const link = $('#link').val();

        e2cTokenInstance
          .mintLink(address, amount, link, { from: account })
          .then(function(result) {
            alert('Tokens emitidos!');

            $('#loading').hide();
            $('#system').show();
            document.getElementById('address').value = '';
            document.getElementById('link').value = '';
            document.getElementById('amount').value = '';

            App.updateUserData();
          })
          .catch(function(err) {
            $('#loading').hide();
            $('#system').show();
            alert(err.message);
            console.error(err);
          });
      });
    });
  },

  // createAccount: function() {
  //   let account = web3.eth.account.create();
  //   $('#account').text(account.address);
  //   $('#privateKey').text(account.privateKey);
  // },

  getRecognitionFlow: function(account) {
    return new Promise(function(resolve, reject) {
      App.contracts.E2CToken.deployed().then(async function(instance) {
        // console.log('Getting flow...');

        var e2cTokenInstance;

        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.error(error);
            reject(error);
          }

          if (!account) account = accounts[0];

          App.contracts.E2CToken.deployed()
            .then(function(instance) {
              e2cTokenInstance = instance;

              return e2cTokenInstance.mintFlow(account);
            })
            .then(async function(result) {
              const decimals = await e2cTokenInstance.decimals.call();
              let flow = result / Math.pow(10, decimals);

              resolve(flow);
            })
            .catch(function(err) {
              console.error(err.message);
              reject(err);
            });
        });
      });
    });
  },

  getTransferFlow: function(account) {
    return new Promise(function(resolve, reject) {
      App.contracts.E2CToken.deployed().then(async function(instance) {
        // console.log('Getting flow...');

        var e2cTokenInstance;

        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.error(error);
            reject(error);
          }

          if (!account) account = accounts[0];

          App.contracts.E2CToken.deployed()
            .then(function(instance) {
              e2cTokenInstance = instance;

              return e2cTokenInstance.receiverFlow(account);
            })
            .then(async function(result) {
              const decimals = await e2cTokenInstance.decimals.call();
              let flow = result / Math.pow(10, decimals);

              resolve(flow);
            })
            .catch(function(err) {
              console.error(err.message);
              reject(err);
            });
        });
      });
    });
  },

  checkAccount: function() {
    App.getBalances($('#checkaccount').val()).then(function(balance) {
      $('#checkbalance').val('Saldo: ' + balance + ' E2C');
    });
    App.getRecognitionFlow($('#checkaccount').val()).then(function(flow) {
      $('#checkRecognitionFlow').val('Fluxo: ' + flow + ' E2C');
    });
    App.getTransferFlow($('#checkaccount').val()).then(function(flow) {
      $('#checkTransferFlow').val('Fluxo: ' + flow + ' E2C');
    });
  },
};

$(document).ready(function() {
  // $('#loginModal').on('shown.bs.modal', function () {
  //   $('#myInput').focus()
  // });

  // $('#signUpModal').on('shown.bs.modal', function () {
  //   $('#myInput').focus()
  // });

  $(function() {
    $(window).load(function() {
      $('#loading').hide();
      App.init();
    });
  });
});
