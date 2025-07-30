export enum RakNetUnconnectedPacketId {
    UnconnectedPing = 0x01,
    UnconnectedPong = 0x1c,
    OpenConnectionRequestOne = 0x05,
    OpenConnectionReplyOne = 0x06,
    OpenConnectionRequestTwo = 0x07,
    OpenConnectionReplyTwo = 0x08,
    AckDatagram = 128 | 64,
    NackDatagram = 128 | 32,
    ValidDatagram = 128
}
export enum RakNetConnectedPacketId {
    ConnectedPing = 0x00,
    ConnectedPong = 0x03,
    ConnectionRequest = 0x09,
    ConnectionRequestAccepted = 0x10,
    NewIncomingConnection = 0x13,
    Disconnect = 0x15,
}