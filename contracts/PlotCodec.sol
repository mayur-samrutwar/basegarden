// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library PlotCodec {
    uint256 private constant OFFSET_STATUS = 0;        // 2 bits
    uint256 private constant OFFSET_SEEDTYPE = 2;      // 14 bits
    uint256 private constant OFFSET_PLANTED_AT = 16;   // 64 bits
    uint256 private constant OFFSET_GROW_DURATION = 80;// 32 bits

    uint256 private constant MASK_STATUS = 0x3;        // 2 bits
    uint256 private constant MASK_SEEDTYPE = 0x3FFF;   // 14 bits
    uint256 private constant MASK_PLANTED_AT = type(uint64).max;
    uint256 private constant MASK_GROW_DURATION = type(uint32).max;

    function encode(
        uint8 status,
        uint16 seedType,
        uint64 plantedAt,
        uint32 growDuration
    ) internal pure returns (uint256 packed) {
        packed =
            (uint256(status & uint8(MASK_STATUS)) << OFFSET_STATUS) |
            (uint256(seedType & uint16(MASK_SEEDTYPE)) << OFFSET_SEEDTYPE) |
            (uint256(plantedAt) << OFFSET_PLANTED_AT) |
            (uint256(growDuration) << OFFSET_GROW_DURATION);
    }

    function statusOf(uint256 packed) internal pure returns (uint8) {
        return uint8((packed >> OFFSET_STATUS) & MASK_STATUS);
    }

    function seedTypeOf(uint256 packed) internal pure returns (uint16) {
        return uint16((packed >> OFFSET_SEEDTYPE) & MASK_SEEDTYPE);
    }

    function plantedAtOf(uint256 packed) internal pure returns (uint64) {
        return uint64((packed >> OFFSET_PLANTED_AT) & MASK_PLANTED_AT);
    }

    function growDurationOf(uint256 packed) internal pure returns (uint32) {
        return uint32((packed >> OFFSET_GROW_DURATION) & MASK_GROW_DURATION);
    }

    function setStatus(uint256 packed, uint8 status) internal pure returns (uint256) {
        uint256 cleared = packed & ~(MASK_STATUS << OFFSET_STATUS);
        return cleared | (uint256(status & uint8(MASK_STATUS)) << OFFSET_STATUS);
    }
}


