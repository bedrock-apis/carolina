### Improve raknet lib

- Separate whole class to two sections, incoming logic and outgoing logic so its more clear
- Rework how resending works, doesn't cache whole outgoing packets but save only reliable capsules and rebuild it in send
  this would also help with buffer reusing in sending final packets.

- Migrate to typescript-native for rolldown declaration types - Suspended Idea as it requires isolatedDeclarations and these are really strict sometimes too strict
- Figure out good event handlers to be used for whole codebase
