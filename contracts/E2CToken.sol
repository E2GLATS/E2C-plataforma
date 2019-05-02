pragma solidity >= 0.4.22 < 0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract E2CToken is ERC20Detailed, ERC20Mintable {
    modifier onlyMinter() {
        require(true);
        _;
    }
    
    event NewLink(uint linkId, string linkUrl, address receiverAddress, address senderAddress, uint amountSent);
    
    struct Link {
        string linkUrl;
        address receiverAddress;
        address senderAddress;
        uint amountSent;
    }
    
    Link[] public links;

    mapping (address => uint256) public mintFlow;
    mapping (address => uint256) public receiverFlow;
    
    mapping (uint => address) public linkReceiverAddress;
    mapping (uint => address) public linkSenderAddress;

	constructor (string memory _name, string memory _symbol, uint8 _decimals) public ERC20Detailed(_name, _symbol, _decimals) { }

    function mintLink(address _to, uint256 _amount, string memory _link) public onlyMinter returns (bool) {
        bool result = super.mint(_to, _amount);
        if(result) {
            mintFlow[_to] += _amount;
            
            uint id = links.push(Link(_link, _to, msg.sender, _amount)) - 1;
            
            linkSenderAddress[id] = msg.sender;
            linkReceiverAddress[id] = _to;
            
            emit NewLink(id, _link, _to, msg.sender, _amount);
        }
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        bool result = super.transfer(_to, _amount);
        if(result) {
            receiverFlow[_to] += _amount;
        }
    }

    function getLinksLen() public view returns (uint256) {
        return links.length;
    }

}
