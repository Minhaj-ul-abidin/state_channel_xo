pragma solidity >0.4.0;

contract Game {

    string hostId;
    string challengerId;

    uint hostEscrow;
    uint challengerescrow;

    struct Player  {
        string playerId;
        address playerAddress;
        uint playerEscrow;
    }

    Player host;
    Player challenger;
    
    event challengerUpdate(string, address, uint);

    constructor(string memory _hostId ) public payable {

        host.playerAddress = msg.sender;

        host.playerId = _hostId;

        host.playerEscrow = msg.value;


    }
    
    function sethostid(string memory _hostId) public returns (string memory, address, uint) {
        host.playerId = _hostId;
        return gethost();
    }

    // Get  game credentials

    function gethost() public view returns (string memory, address, uint){
        return (host.playerId, host.playerAddress, host.playerEscrow);
    }

    function getchallenger() public view returns (string memory, address, uint){
        return (challenger.playerId, challenger.playerAddress, challenger.playerEscrow);
    }

    // Set game credentials

    function setchallenger(string memory _playerId) public payable returns (string memory, address, uint){
        challenger.playerId = _playerId;
        challenger.playerAddress = msg.sender;
        challenger.playerEscrow = challenger.playerEscrow + msg.value;
        
        emit challengerUpdate(challenger.playerId, challenger.playerAddress, challenger.playerEscrow);

        return (challenger.playerId, challenger.playerAddress, challenger.playerEscrow);
    }

    // Dispute settlement

    // Victory settlement
}