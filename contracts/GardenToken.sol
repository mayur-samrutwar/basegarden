// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GardenToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    error NotMinter();

    event MinterSet(address indexed account, bool allowed);

    constructor() ERC20("Garden", "GARDEN") Ownable(msg.sender) {}

    function setMinter(address account, bool allowed) external onlyOwner {
        minters[account] = allowed;
        emit MinterSet(account, allowed);
    }

    function mint(address to, uint256 amount) external {
        if (!minters[msg.sender]) revert NotMinter();
        _mint(to, amount);
    }
}


