// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Items1155 is ERC1155, Ownable {
    mapping(address => bool) public minters;
    mapping(address => bool) public burners;

    error NotMinter();
    error NotBurner();

    event MinterSet(address indexed account, bool allowed);
    event BurnerSet(address indexed account, bool allowed);

    constructor(string memory uri_) ERC1155(uri_) Ownable(msg.sender) {}

    function setMinter(address account, bool allowed) external onlyOwner {
        minters[account] = allowed;
        emit MinterSet(account, allowed);
    }

    function setBurner(address account, bool allowed) external onlyOwner {
        burners[account] = allowed;
        emit BurnerSet(account, allowed);
    }

    function mint(address to, uint256 id, uint256 amount, bytes memory data) external {
        if (!minters[msg.sender]) revert NotMinter();
        _mint(to, id, amount, data);
    }

    function burn(address from, uint256 id, uint256 amount) external {
        if (!burners[msg.sender]) revert NotBurner();
        _burn(from, id, amount);
    }
}


