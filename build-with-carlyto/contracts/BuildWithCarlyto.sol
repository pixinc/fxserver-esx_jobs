// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Build with Carlyto — membership collection
/// @notice One deployment per tier: Day One (100) and Builder (1500).
///         Tokens are membership badges: no profit share, no security.
///         Each holder can engrave a ledger name once; metadata evolves
///         off-chain (venture badges) and marketplaces are refreshed via
///         ERC-4906 events.
contract BuildWithCarlyto is ERC721, IERC4906, Ownable, ReentrancyGuard {
    uint256 public immutable maxSupply;
    uint256 public price;          // wei per token
    uint256 public totalSupply;    // also the last minted tokenId (ids start at 1)
    uint256 public maxPerTx = 3;
    bool public mintOpen;
    string private baseTokenURI;

    /// tokenId => name engraved by its holder (once, immutable)
    mapping(uint256 => string) public ledgerName;

    event NameEngraved(uint256 indexed tokenId, string name);
    event MintOpenSet(bool open);
    event PriceSet(uint256 price);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 priceWei_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        require(maxSupply_ > 0, "supply=0");
        maxSupply = maxSupply_;
        price = priceWei_;
        baseTokenURI = baseURI_;
    }

    // ---------------- Mint ----------------

    function mint(uint256 quantity) external payable nonReentrant {
        require(mintOpen, "mint closed");
        require(quantity > 0 && quantity <= maxPerTx, "bad quantity");
        require(totalSupply + quantity <= maxSupply, "sold out");
        require(msg.value == price * quantity, "wrong value");
        for (uint256 i = 0; i < quantity; i++) {
            totalSupply += 1;
            _safeMint(msg.sender, totalSupply);
        }
    }

    /// @notice Reserved mints (team, physical-kit replacements, partnerships).
    function treasuryMint(address to, uint256 quantity) external onlyOwner {
        require(totalSupply + quantity <= maxSupply, "sold out");
        for (uint256 i = 0; i < quantity; i++) {
            totalSupply += 1;
            _safeMint(to, totalSupply);
        }
    }

    // ---------------- Ledger name ----------------

    /// @notice Engrave your name in the registry. Once per token, immutable.
    function engraveName(uint256 tokenId, string calldata name_) external {
        require(ownerOf(tokenId) == msg.sender, "not the holder");
        require(bytes(ledgerName[tokenId]).length == 0, "already engraved");
        uint256 len = bytes(name_).length;
        require(len >= 2 && len <= 24, "2-24 bytes");
        ledgerName[tokenId] = name_;
        emit NameEngraved(tokenId, name_);
        emit MetadataUpdate(tokenId);
    }

    // ---------------- Admin ----------------

    function setMintOpen(bool open) external onlyOwner {
        mintOpen = open;
        emit MintOpenSet(open);
    }

    function setPrice(uint256 priceWei_) external onlyOwner {
        price = priceWei_;
        emit PriceSet(priceWei_);
    }

    function setMaxPerTx(uint256 n) external onlyOwner {
        require(n > 0, "n=0");
        maxPerTx = n;
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        baseTokenURI = uri;
        if (totalSupply > 0) emit BatchMetadataUpdate(1, totalSupply);
    }

    /// @notice Ping marketplaces after an off-chain badge update (new venture
    ///         launched, chapter completed...): metadata JSON changed server-side.
    function refreshMetadata() external onlyOwner {
        if (totalSupply > 0) emit BatchMetadataUpdate(1, totalSupply);
    }

    function withdraw(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "to=0");
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }

    // ---------------- Views ----------------

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165)
        returns (bool)
    {
        return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
    }
}
