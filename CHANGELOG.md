# Carolina Changelog

# 0.0.0-alpha.3
 - Implemented Login Packet
 - Implemented connection network settings establishing and support for MC packets framing
 - Implemented Encapsulation type for binary, should be use in cases where packet/type has buffer 
  field with has it own serialization login and all these data has to be size prefixed.

# 0.0.0-alpha.2
 - Implemented first packets, created @/protocol package
   - RequestNetworkSettingsPacket
   - NetworkSettingsPacket
 - Added Boolean type to the core of @/binary
 - Written all changes so far, to `root:/CHANGELOG.md`

## 0.0.0-alpha.1
 - Refactored parts of raknet implementation, for better support for bundler's treeshaking
 - Refactored parts of raknet implementation, for later raknet client implementation, don't waste code that is shared!
 - Implemented @/binary, runtime compiled type system, core primitive types included, All Number types, String Types, Boolean, Buffer Types, Add decorator helpers for faster class metadata definitions
 - Implemented runtime compilation with primitive inlining, most of the number types and boolean are inline for better performance and reducing call stack overhead

## T-0
 - NBT Moved To separated repository as standalone package
 - Refactored Repo to use Workspaces in right way, (Managed cross dependencies in right way)
 - Added TurboRepo helper for workspaces
 - Added and configured rolldown for proper workspaces configuration
 - Added and configured oxlint
 - Added and configured vitest testing framework
 - Added and configured prettier for common formatting
 - Move from TS to TSGO for performance
 - Created markdown files in root
 - Created `.vscode/settings.json` for faster project setup, added proper recommended extensions
 - Improved package scripts
 - Written good practices and manners when contributing in here, check [MANNERS.md](./MANNERS.md)

## T-1
 - Basic NBT Implementation
 - Finalized Raknet Implementation
 - Refactored Repo to use pnpm workspace

## T-2
 - Repo Initialized
 - PNPM Initialized
 - Package Initialization
 - Highly efficient re-implementation of raknet, offline packets yet
