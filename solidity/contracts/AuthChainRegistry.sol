// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AuthChainRegistry is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _workIds;
    Counters.Counter private _licenseIds;

    // Struct for a Work
    struct Work {
        uint256 id;
        address creator;
        string title;
        string ipfsHash; // Hash of the work stored on IPFS
        string metadata; // Additional metadata (e.g., type, genre)
        uint256 timestamp;
    }

    // Struct for a License
    struct License {
        uint256 id;
        uint256 workId;
        address licensee;
        uint256 price; // Price in wei
        uint256 duration; // Duration in seconds
        string usageType; // e.g., "commercial", "non-commercial"
        bool active;
    }

    // Mappings
    mapping(uint256 => Work) public works;
    mapping(uint256 => License) public licenses;
    mapping(uint256 => uint256[]) public workToLicenses; // Maps work ID to its license IDs
    mapping(address => uint256[]) public creatorWorks; // Maps creator address to their work IDs

    // Events
    event WorkRegistered(uint256 indexed workId, address indexed creator, string title, string ipfsHash, uint256 timestamp);
    event LicenseCreated(uint256 indexed licenseId, uint256 indexed workId, address indexed licensee, uint256 price, uint256 duration, string usageType);
    event LicenseActivated(uint256 indexed licenseId, uint256 indexed workId, address indexed licensee);
    event RoyaltyDistributed(uint256 indexed workId, address indexed creator, uint256 amount);

    constructor() Ownable() {
        _workIds.increment(); // Start IDs at 1
        _licenseIds.increment();
    }

    // Register a new work
    function registerWork(string memory title, string memory ipfsHash, string memory metadata) public {
        uint256 newWorkId = _workIds.current();
        works[newWorkId] = Work({
            id: newWorkId,
            creator: msg.sender,
            title: title,
            ipfsHash: ipfsHash,
            metadata: metadata,
            timestamp: block.timestamp
        });
        creatorWorks[msg.sender].push(newWorkId);
        _workIds.increment();
        emit WorkRegistered(newWorkId, msg.sender, title, ipfsHash, block.timestamp);
    }

    // Create a license for a work
    function createLicense(
        uint256 workId,
        uint256 price,
        uint256 duration,
        string memory usageType
    ) public {
        require(works[workId].creator == msg.sender, "Only creator can create licenses");
        uint256 newLicenseId = _licenseIds.current();
        licenses[newLicenseId] = License({
            id: newLicenseId,
            workId: workId,
            licensee: address(0),
            price: price,
            duration: duration,
            usageType: usageType,
            active: false
        });
        workToLicenses[workId].push(newLicenseId);
        _licenseIds.increment();
        emit LicenseCreated(newLicenseId, workId, address(0), price, duration, usageType);
    }

    // Purchase and activate a license
    function purchaseLicense(uint256 licenseId) public payable {
        License storage license = licenses[licenseId];
        require(!license.active, "License already active");
        require(msg.value >= license.price, "Insufficient payment");
        require(works[license.workId].id != 0, "Work does not exist");

        license.licensee = msg.sender;
        license.active = true;

        // Distribute royalty to creator
        address creator = works[license.workId].creator;
        (bool sent, ) = creator.call{value: msg.value}("");
        require(sent, "Royalty distribution failed");

        emit LicenseActivated(licenseId, license.workId, msg.sender);
        emit RoyaltyDistributed(license.workId, creator, msg.value);
    }

    // Get work details
    function getWork(uint256 workId) public view returns (Work memory) {
        require(works[workId].id != 0, "Work does not exist");
        return works[workId];
    }

    // Get license details
    function getLicense(uint256 licenseId) public view returns (License memory) {
        require(licenses[licenseId].id != 0, "License does not exist");
        return licenses[licenseId];
    }

    // Get all works by a creator
    function getCreatorWorks(address creator) public view returns (uint256[] memory) {
        return creatorWorks[creator];
    }

    // Get all licenses for a work
    function getWorkLicenses(uint256 workId) public view returns (uint256[] memory) {
        require(works[workId].id != 0, "Work does not exist");
        return workToLicenses[workId];
    }

    // Withdraw contract balance (for admin tasks, e.g., fees)
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Withdrawal failed");
    }
}