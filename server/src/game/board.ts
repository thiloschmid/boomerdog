/* 
The board class consists of an array representing the different nodes on the
board. Let N be the number of players.

0, 1, ..., N-1      : occupied by a marble of that player
N                   : unoccupied
10, 11, ... 10+N-1  : occupied by a marble of that player (-10) and blocking

Additionally there are the endzones represented by the indices 

100, 101, 102, 103  : endzone spots for player 0
110, 111, 112, 113  : endzone spots for player 1
etc. 

Throughout the class, p is used for the player number and n stands for the node
index. 
*/


export type MoveValidation = [true, (() => void)] | [false, string];

export default class Board {
    nPlayers: number;
    nNodes: number;
    nodes: number[];
    playerInfo: {
        endzone: boolean[],         // corresponding to the four spots
        marbles: Set<number>,       // the players marbles on the board
        base: number
    }[];           // number of marbles still in the base

    constructor(nPlayers: number) {
        this.nPlayers = nPlayers;
        this.nNodes = 16 * nPlayers;

        // create the node array and fill it with "empty" nodes
        // nPlayers corresponds to empty nodes
        this.nodes = Array(this.nNodes).fill(nPlayers)

        this.playerInfo = Array(nPlayers)

        for (let i =0; i < nPlayers; i++) {
            this.playerInfo[i] = {
                endzone: [false, false, false, false],
                marbles: new Set(),
                base: 4
            }
        }
    }

    /**
     * Returns the range of board indices which are passed by a marble 
     * travelling from the origin node to the destination node.
     * 
     * For example, for origin = 12 and destination = 16 return [13, 14, 15, 16],
     * and for origin = 62 and destination = 5 return [63, 0, 1, 2, 3, 4, 5]. If the
     * endzone is involved, for instance for origin = 13, destination = 112, it 
     * resolves to [14, 15, 16, 110, 111, 112].
     * 
     * @param origin - The board index of the origin node
     * @param destination - The board index of the destination node
     * @param moveBackwards - Indicates moving direction (i.e. for a 4️⃣)
     * @returns The range of board indices between `origin` and `destination`
     */
    getIntermediateNodeIndices(
        origin: number,
        destination: number,
        moveBackwards: boolean = false
    ): number[] {
        if (origin >= 100 && (destination - origin) > 0) {
            return [...Array(destination - origin).keys()].map(
                i => origin + i + 1)
        }
        if (destination >= 100) {
            // try to enter the endzone
            let p = Math.floor((destination - 100) / 10);

            let l = (destination - 100) % 10 + 1 // gives 2 for 101 etc.
            let endzoneNodes = [...Array(l).keys()].map(i => 100 + 10 * p + i);

            return [
                ...this.getIntermediateNodeIndices(origin, 16 * p),
                ...endzoneNodes
            ]

        }
        if (!moveBackwards) {
            let length = destination > origin
                ? destination - origin
                : destination + this.nNodes - origin;
            return [...Array(length).keys()].map(
                i => (origin + i + 1) % (this.nNodes))
        }
        else {
            let length = destination < origin
                ? origin - destination
                : origin + this.nNodes - destination;
            return [...Array(length).keys()].map(
                i => (origin + this.nNodes - i - 1) % (this.nNodes))
        }
    }


    /**
     * Computes the index of the node which would be reached by performing the
     * move.
     * 
     * @param origin - The index of the origin node
     * @param move - The requested move
     * @returns - The index of the destination node
     */
    getDestination(origin: number, move: number) {
        if (origin >= 100) return null;
        return (origin + this.nNodes + move) % this.nNodes
    }

    /**
     * Computes the index of the node in the endzone which would be reached by 
     * performing the move.
     * 
     * Returns 0 if it is not possible to reach the endzone. 
     * 
     * @param p - The player number
     * @param origin - The index of the origin node
     * @param move - The requested move
     * @returns The index of the destination node in the endzone, or null.
     */
    getEndzoneDestination(p: number, origin: number, move: number) {
        // check if the node is blocking => it cannot enter the endzone
        if (this.nodes[origin] === 10 + p) {
            return null
        }
        let distanceToEndzone = origin >= 100
            ? 100 + 10 * p - origin
            : (p * 16 + this.nNodes - origin) % this.nNodes + 1

        let remainder = move - distanceToEndzone;

        if (remainder < 4 && remainder > 0) return 100 + 10 * p + remainder

        return null;
    }

    /**
     * 
     * @param p - The player number
     * @param intermediateNodeIndices - An array of node indices which are
     * passed by the move
     * @returns 
     */
    isReachable(p: number, intermediateNodeIndices: number[]) {
        for (let n of intermediateNodeIndices) {
            if (n > this.nNodes) {
                // try to enter the endzone e.g. if n=112 corresponds to 
                // playerInfo[1].endzone[2]
                if (this.playerInfo[p].endzone[n - 100 - 10 * p]) {
                    return false;
                }
            }
            else if (this.nodes[n] >= 10) {
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @param p - The player number
     * @param origin - The index of the origin node
     * @param move - The requested move
     * @returns - An array of the nodes which are reachable by the given move, 
     * or `null` if it is not possible to reach.
     */
    getPossibleDestinations(p: number, origin: number, move: number) {
        // if moving along the nodes
        let destination = this.getDestination(origin, move);
        let endzoneDestination = this.getEndzoneDestination(p, origin, move);

        let possibleDestinations = [];

        destination
            && this.isReachable(p,
                this.getIntermediateNodeIndices(origin, destination, move < 0))
            && possibleDestinations.push(destination);

        // if the endzone destination exists and it is reachable, append it
        endzoneDestination
            && this.isReachable(p,
                this.getIntermediateNodeIndices(
                    origin, endzoneDestination, move < 0))
            && possibleDestinations.push(endzoneDestination);

        return possibleDestinations;
    }

    /**
     * Checks if a proposed move from `origin` to `destination` is valid. For 
     * example, if a blocking marble is in the way the move is not valid. 
     * This function has to be called in order to execute a move. This is 
     * guaranteed by returning a callback function as the second argument to
     * execute the move.
     * 
     * @param p - The player number
     * @param origin - The board index of the origin node
     * @param move - The requested move
     * @param enterEndzone - In case of ambiguity indicates if the marble 
     * should enter the endzone
     * @returns An array containing the validity of the move and, if true, the
     * callback function which executes the move, or, if false, the reason why
     * the move is invalid. 
     */
    validateMove(p: number, origin: number, move: number,
        enterEndzone: boolean = false)
        : MoveValidation {

        let destination: number;

        if (origin >= 100) {
            // make sure origin belongs to the endzone of player p
            if (Math.floor((origin - 100) / 10) !== p) {
                return [false, "Invalid origin"]
            }

            // make sure a marble is positioned there
            if (!this.playerInfo[p].endzone[origin - 100 - 10 * p]) {
                return [false, "No marble at specified node"]
            }
        } else {
            // make sure his marble is at the origin node
            if (this.nodes[origin] !== p && this.nodes[origin] !== p + 10)
                return [false, "Marble not found"];
        }

        if (enterEndzone || origin >= 100) {
            let endzoneDestination = this.getEndzoneDestination(p, origin, move);
            if (endzoneDestination === null) {
                return [false, "Move in the endzone not possible"]
            }
            destination = endzoneDestination;
        } else {
            let regularDestination = this.getDestination(origin, move);
            if (regularDestination === null) {
                return [false, "Move not possible"]
            }
            destination = regularDestination;
        }

        let intermediateNodeIndices = this.getIntermediateNodeIndices(
            origin, destination, move < 0);

        if (!this.isReachable(p, intermediateNodeIndices))
            return [false, "There is something in the way"]

        return [
            true,
            () => this._moveMarble(p, origin, destination,
                move > 70
                    ? intermediateNodeIndices.filter(n => n < 100)
                    : undefined),
        ];
    }

    _moveMarble(p: number, origin: number, destination: number,
        sevenPlayed: number[] | undefined) {

        // clear the old position
        this.nodes[origin] = this.nPlayers;

        if (sevenPlayed) {
            // clear all nodes between origin and destination
            for (let n of sevenPlayed) {
                if (n < 100) this.clearNode(n);
            }
        } else {
            // only clear the destination node
            this.clearNode(destination);
        }

        // put the new marble into that position
        this.nodes[destination] = p;
        this.playerInfo[p].marbles.delete(origin)
        this.playerInfo[p].marbles.add(destination)
    }

    /**
     * Clears a position on the board and returns any marble on it back to the 
     * base of the respective player.
     * 
     * @param n - The node to be cleared
     */
    clearNode(n: number) {
        if (this.nodes[n] < this.nPlayers) {
            // the new position was occupied by a marble of a player
            let p = this.nodes[n]

            // put the marble back to the players base
            this.playerInfo[p].base++;
            this.playerInfo[p].marbles.delete(n)
        }
    }

    /**
     * 
     * @param p - The player number
     * @param swip - The board index of the first marble to be switched
     * @param swap - The board index of the second marble to be switched
     * @returns An array containing the validity of the switch and, if true, the
     * callback function which executes the switch, or, if false, the reason why
     * the switch is invalid. 
     */
    validateSwitch(p: number, swip: number, swap: number)
        : MoveValidation {
        let a = this.nodes[swip]
        let b = this.nodes[swap]

        // assert that none of the marbles is blocked
        if (a >= 10 || b >= 10) return [false, ""];

        // assert that exactly one of the marbles belongs to player #i
        if (+(a === p) + +(b === p) !== 1)
            return [false, ""];

        // make sure neither swip nor swap are empty
        if (a === this.nPlayers || b === this.nPlayers) return [false, ""];

        return [true, () => this._switchMarbles(swip, swap)]
    }

    _switchMarbles(swip: number, swap: number) {
        let p1 = this.nodes[swip];
        let p2 = this.nodes[swap];

        // player 1 has his marble moved from swip to swap
        this.playerInfo[p1].marbles.delete(swip);
        this.playerInfo[p1].marbles.add(swap);
        this.nodes[swap] = p1

        // player 2 has his marble moved from swap to swip
        this.playerInfo[p2].marbles.delete(swap)
        this.playerInfo[p2].marbles.add(swip)
        this.nodes[swip] = p2;
    }

    /**
     * 
     * @param p - The number of the exiting player
     * @returns - An array containing the validity of the move and, if true, the
     * callback function which executes the move, or, if false, the reason why
     * the move is invalid. 
     */
    validateOut(p: number): MoveValidation {
        // verify that base is not empty
        if (!this.playerInfo[p].base) return [false, "The base is empty"];

        // verify that entry node is not occupied by own blocking marble
        if (this.nodes[16 * p] === 10 + p) return [false, "Exit is blocked"];

        return [true, () => this._goOut(p)];
    }

    _goOut(p: number) {
        let outIndex = 16 * p;
        // clear any marble
        this.clearNode(outIndex);

        // set the marble to its new blocking position
        this.nodes[outIndex] = 10 + p;
        this.playerInfo[p].base--
        this.playerInfo[p].marbles.add(outIndex)
    }

    playerCanSwitch(p: number) {
        // get all nonblocking marbles
        let switchCandidates = new Set(
            this.nodes.filter(n => n < this.nPlayers));
        return switchCandidates.has(p) && switchCandidates.size > 1
    }

    playerCanMove(p: number, move: number) {
        for (let n of this.playerInfo[p].marbles.values()) {

            if (this.getPossibleDestinations(p, n, move).length) return true;
        }
        return false;
    }

    playerCanCompleteSeven(p: number) {
        if (this.playerCanMove(p, 7)) {
            return true;
        }
        let possibilities = Array(6).fill(0);
        for (let j = 5; j >= 0; j--) {
            for (let n of this.playerInfo[p].marbles.values()) {
                if (this.getPossibleDestinations(p, n, j + 1).length) {
                    possibilities[j]++
                }
            }
        }

        return (possibilities[5] > 0 && possibilities[0] > 1)   // [6, 1] 
            || (possibilities[4] > 0 && possibilities[1] > 1)   // [5, 2]
            || (possibilities[3] > 0 && possibilities[2] > 1)   // [4, 3]
            || (possibilities[4] > 0 && possibilities[0] > 2)   // [5, 1, 1]
            || (possibilities[3] > 0 && possibilities[1] > 1
                && possibilities[0] > 2)                        // [4, 2, 1]
            || (possibilities[3] > 0 && possibilities[0] > 3)   // [4, 1, 1, 1]
            || (possibilities[2] > 1 && possibilities[0] > 2)   // [3, 3, 1]
            || (possibilities[2] > 0 && possibilities[1] > 2)   // [3, 2, 2]
            || (possibilities[2] > 0 && possibilities[1] > 1
                && possibilities[0] > 3)                        // [3, 2, 1, 1]
            || (possibilities[1] > 2 && possibilities[0] > 3)   // [2, 2, 2, 1]
    }

    /**
     * ⚠️ This method does not conserve the number of marbles on the board ⚠️
     * Sets the marble from player to position n.
     * 
     * @param p - The respective player
     * @param n - The affected node index
     */
    setMarble(p: number, n: number) {
        this.nodes[n] = p;
        this.playerInfo[p].marbles.add(n)
    }

    toObject() {
        return {
            nPlayers: this.nPlayers,
            nodes: this.nodes,
            playerInfo: this.playerInfo
        }
    }

    static fromObject(
        board: {
            nPlayers: number,
            nodes: number[],
            playerInfo: {
                endzone: boolean[],
                marbles: Set<number>,
                base: number
            }[]
        }
    ) {
        // create a new board based on the settings passed as an object
        let newBoard = new Board(board.nPlayers);
        newBoard.nodes = board.nodes;
        newBoard.playerInfo = board.playerInfo;

        return newBoard;
    }
}
