// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Faucet {
    address payable public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // 1. Test if the owner is correctly set
    constructor() payable {
        owner = payable(msg.sender);
    }

    // 2. Test if attempting to withdraw more than 0.1 amount of ether reverts the transaction
    // 3. Test if amount <= 0.1 ETH can be withdrawn without any
    // 4. Test if the withdrawn balance is sent to the correct (sender) address
    function withdraw(uint256 _amount) public payable {
        // users can only withdraw .1 ETH at a time, feel free to change this!
        require(
            _amount <= 100000000000000000 && _amount <= address(this).balance
        );
        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    // 5. Test if the transaction reverts when withdrawAll is called by non-owner address
    // 6. Test if the owner can call withdrawAll successfully
    // 7. Test if the contract balance becomes zero and owner's account is incremented after withdrawing all funds
    function withdrawAll() public onlyOwner {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    // 8. Test if the transaction reverts when non-owner tries to destroy the contract
    // 9. Test if the owner can destroy the contract
    // 10. Test if the contract after being destroyed has all its fund transfered to owner address
    // 11. Test if the contract after being destroyed has its code wiped out
    function destroyFaucet() public onlyOwner {
        selfdestruct(owner);
    }
}
