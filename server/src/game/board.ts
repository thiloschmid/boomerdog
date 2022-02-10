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

export type MoveValidation = [true, () => void] | [false, string];

export default class Board {
    nPlayers: number;
    nNodes: number;
    nodes: number[];

    playerInfo: {
        endzone: boolean[]; // lenght 4 corresponding to the four spots
        base: number; // number of marbles still in the base
    }[];

    // For each player, store an array with their marble locations,
    // corresponding to the indices above. The value -1 stands for a marble
    // in the base.
    marbleLocations: number[][];

    constructor(nPlayers: number) {
        this.nPlayers = nPlayers;
        this.nNodes = 16 * nPlayers;

        // create the node array and fill it with "empty" nodes
        // nPlayers corresponds to empty nodes
        this.nodes = Array(this.nNodes).fill(nPlayers);

        // ⚠️ fill works only for primitives
        this.playerInfo = Array.from({ length: nPlayers }, (e) => ({
            endzone: [false, false, false, false],
            base: 4,
        }));

        // -1 means in the base
        this.marbleLocations = Array.from({ length: nPlayers }, (e) => [
            -1, -1, -1, -1,
        ]);
    }

    isRegularIndex(n: number) {
        return n >= 0 && n < this.nNodes;
    }

    /**
     *
     * @param n The node index
     * @returns The player p and the index in its endzone the node index
     *          corresponds to. [p, i]. Returns null if the index does not
     *          correspond to an endzone index.
     */
    indexToEndzoneIndex(n: number): [number, number] | null {
        // n has to take values between 100 and 143 or 163
        if (n < 100 || n > 103 + 10 * this.nPlayers) {
            return null;
        }
        let m = n - 100;
        let i = m % 10;
        if (i > 3) {
            return null;
        }
        return [Math.floor(m / 10), i];
    }

    getBoardData() {
        return this.marbleLocations;
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
        if (origin >= 100 && destination - origin > 0) {
            return [...Array(destination - origin).keys()].map(
                (i) => origin + i + 1
            );
        }
        if (destination >= 100) {
            // try to enter the endzone
            let p = Math.floor((destination - 100) / 10);

            let l = ((destination - 100) % 10) + 1; // gives 2 for 101 etc.
            let endzoneNodes = [...Array(l).keys()].map(
                (i) => 100 + 10 * p + i
            );

            return [
                ...this.getIntermediateNodeIndices(origin, 16 * p),
                ...endzoneNodes,
            ];
        }
        if (!moveBackwards) {
            let length =
                destination > origin
                    ? destination - origin
                    : destination + this.nNodes - origin;
            return [...Array(length).keys()].map(
                (i) => (origin + i + 1) % this.nNodes
            );
        } else {
            let length =
                destination < origin
                    ? origin - destination
                    : origin + this.nNodes - destination;
            return [...Array(length).keys()].map(
                (i) => (origin + this.nNodes - i - 1) % this.nNodes
            );
        }
    }

    /**
     * Computes the index of the node which would be reached by performing the
     * move.
     *
     * @param n - The index of the  node
     * @param distance - The requested move distance
     * @returns - The index of the destination node
     */
    getDestination(n: number, distance: number) {
        if (n >= 100) return null;
        return (n + this.nNodes + distance) % this.nNodes;
    }

    /**
     * Computes the index of the node in the endzone which would be reached by
     * performing the move.
     *
     * Returns null if it is not possible to reach the endzone.
     *
     * @param p - The player number
     * @param n - The index of the origin node
     * @param move - The requested move
     * @returns The index of the destination node in the endzone, or null.
     */
    getEndzoneDestination(p: number, n: number, move: number) {
        // check if the node is blocking => it cannot enter the endzone
        if (this.nodes[n] === 10 + p) {
            return null;
        }
        let distanceToEndzone =
            n >= 100
                ? 100 + 10 * p - n
                : ((p * 16 + this.nNodes - n) % this.nNodes) + 1;

        let remainder = move - distanceToEndzone;

        if (remainder < 4 && remainder > 0) return 100 + 10 * p + remainder;

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
            } else if (this.nodes[n] >= 10) {
                return false;
            }
        }
        return true;
    }

    /**
     *
     * @param p - The player index
     * @param n - The node index
     * @param move - The requested move
     * @returns - An array of the nodes which are reachable by the given move,
     * or `null` if it is not possible to reach.
     */
    getPossibleDestinations(p: number, n: number, move: number): number[] {
        let distance;
        switch (move) {
            // handle going out
            case 0:
                this.validateOut(p);
                return [p * 16];

            // first handle regular moves
            case 1:
            case 2:
            case 3:
            case 4:
            case -4:
            case 5:
            case 6:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
                distance = move;
                break;

            // handle switcheroos
            case 14:
                return this.getSwitchCandidates(p);

            case 71:
            case 72:
            case 73:
            case 74:
            case 75:
            case 76:
            case 77:
                distance = move - 70;
                // TODO: check if the 7 moves can be completed
                break;
            default:
                return [];
        }
        // if moving along the nodes
        // const n = this.marbleLocations[p][m];

        if (n === -1) {
            return [];
        }

        let destination = this.getDestination(n, distance);
        let endzoneDestination = this.getEndzoneDestination(p, n, distance);

        let possibleDestinations = [];

        destination &&
            this.isReachable(
                p,
                this.getIntermediateNodeIndices(n, destination, distance < 0)
            ) &&
            possibleDestinations.push(destination);

        // if the endzone destination exists and it is reachable, append it
        endzoneDestination &&
            this.isReachable(
                p,
                this.getIntermediateNodeIndices(
                    n,
                    endzoneDestination,
                    distance < 0
                )
            ) &&
            possibleDestinations.push(endzoneDestination);

        return possibleDestinations;
    }

    /**
     * Checks if a proposed move from `origin` to `destination` is valid. For
     * example, if a blocking marble is in the way the move is not valid.
     * This function has to be called in order to execute a move. This is
     * guaranteed by returning a callback function as the second argument to
     * execute the move.
     *
     * @param p - The player index
     * @param m - The marble index
     * @param move - The requested move
     * @param enterEndzone - In case of ambiguity indicates if the marble
     * should enter the endzone
     * @returns An array containing the validity of the move and, if true, the
     * callback function which executes the move, or, if false, the reason why
     * the move is invalid.
     */
    validateMove(
        p: number,
        m: number,
        move: number,
        enterEndzone: boolean = false
    ): MoveValidation {
        const n = this.marbleLocations[p][m];

        let destination: number;
        if (n >= 100) {
            // make sure n belongs to the endzone of player p
            if (Math.floor((n - 100) / 10) !== p) {
                return [false, "Invalid n"];
            }

            // make sure a marble is positioned there
            if (!this.playerInfo[p].endzone[n - 100 - 10 * p]) {
                return [false, "No marble at specified node"];
            }
        } else {
            // make sure his marble is at the n node
            if (this.nodes[n] !== p && this.nodes[n] !== p + 10)
                return [false, "Marble not found"];
        }

        if (enterEndzone || n >= 100) {
            let endzoneDestination = this.getEndzoneDestination(p, n, move);
            if (endzoneDestination === null) {
                return [false, "Move in the endzone not possible"];
            }
            destination = endzoneDestination;
        } else {
            let regularDestination = this.getDestination(n, move);
            if (regularDestination === null) {
                return [false, "Move not possible"];
            }
            destination = regularDestination;
        }

        let intermediateNodeIndices = this.getIntermediateNodeIndices(
            n,
            destination,
            move < 0
        );

        if (!this.isReachable(p, intermediateNodeIndices))
            return [false, "There is something in the way"];

        return [
            true,
            () =>
                this._moveMarble(
                    p,
                    n,
                    destination,
                    move > 70
                        ? intermediateNodeIndices.filter((n) => n < 100)
                        : undefined
                ),
        ];
    }

    _moveMarble(
        p: number,
        m: number,
        nNew: number,
        sevenPlayed: number[] | undefined
    ) {
        // node index of the marble
        const n = this.marbleLocations[p][m];

        if (this.isRegularIndex(n)) {
            // clear the old position
            this.nodes[n] = this.nPlayers;
        }
        if (sevenPlayed) {
            // clear all on the way
            for (let n of sevenPlayed) {
                this.clearNode(n);
            }
        } else {
            // only clear the destination node
            this.clearNode(nNew);
        }

        // put the new marble into that position
        this.nodes[nNew] = p;
        // update marbleLocations
        this.marbleLocations[p][m] = nNew;
    }

    /**
     *
     * @param pSwip - The first player number
     * @param pSwap - The second player number
     * @param swip - The marble index of the first marble to be switched
     * @param swap - The marble index of the second marble to be switched
     * @returns An array containing the validity of the switch and, if true, the
     * callback function which executes the switch, or, if false, the reason why
     * the switch is invalid.
     */
    validateSwitch(
        pSwip: number,
        pSwap: number,
        mSwip: number,
        mSwap: number
    ): MoveValidation {
        if (pSwip === pSwap) {
            return [false, `Players can't exchange their own marbles`];
        }
        // obtain corresponding node indices
        const nSwip = this.marbleLocations[pSwip][mSwip];
        const nSwap = this.marbleLocations[pSwap][mSwap];

        // make sure both are regular indices
        if (!this.isRegularIndex(nSwip) || !this.isRegularIndex(nSwap)) {
            return [false, `Invalid indices ${nSwip}, ${nSwap}`];
        }

        // assert that none of the marbles is blocked
        if (this.nodes[nSwip] >= 10 || this.nodes[nSwap] >= 10)
            return [false, "One of the marbles is blocked"];

        return [true, () => this._switchMarbles(pSwip, pSwap, mSwip, mSwap)];
    }

    _switchMarbles(pSwip: number, pSwap: number, mSwip: number, mSwap: number) {
        // player 1 has his marble moved from swip to swap
        const nSwip = this.marbleLocations[pSwip][mSwip];
        const nSwap = this.marbleLocations[pSwap][mSwap];

        // update marbleLocations
        this.marbleLocations[pSwip][mSwip] = nSwap;
        this.marbleLocations[pSwap][mSwap] = nSwip;

        // update nodes
        this.nodes[nSwip] = pSwap;
        this.nodes[nSwap] = pSwip;
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
        this.playerInfo[p].base--;

        // first marble in base in marbleLocations goes out
        const m = this.marbleLocations[p].indexOf(-1);
        this.marbleLocations[p][m] = outIndex;
    }

    getSwitchCandidates(p: number) {
        const switchCandidates = [];
        for (let i = 0; i < this.nNodes; i++) {
            this.nodes[i] < this.nPlayers &&
                this.nodes[i] !== p &&
                switchCandidates.push(i);
        }
        return switchCandidates;
    }

    playerCanSwitch(p: number) {
        const switchableMarbles = this.marbleLocations[p].filter(
            (n) => this.nodes[n] < this.nPlayers
        );
        return !!(
            this.getSwitchCandidates(p).length && switchableMarbles.length
        );
    }

    playerCanMove(p: number, move: number) {
        for (let m = 0; m < 4; m++) {
            if (this.getPossibleDestinations(p, this.marbleLocations[p][m], move).length) {
                return true;
            }
        }
        return false;
    }

    playerCanCompleteSeven(p: number) {
        if (this.playerCanMove(p, 77)) {
            return true;
        }
        let possibilities = Array(6).fill(0);
        for (let j = 5; j >= 0; j--) {
            for (let n of this.marbleLocations[p]) {
                if (this.getPossibleDestinations(p, n, j + 1).length) {
                    possibilities[j]++;
                }
            }
        }

        return (
            (possibilities[5] > 0 && possibilities[0] > 1) || // [6, 1]
            (possibilities[4] > 0 && possibilities[1] > 1) || // [5, 2]
            (possibilities[3] > 0 && possibilities[2] > 1) || // [4, 3]
            (possibilities[4] > 0 && possibilities[0] > 2) || // [5, 1, 1]
            (possibilities[3] > 0 &&
                possibilities[1] > 1 &&
                possibilities[0] > 2) || // [4, 2, 1]
            (possibilities[3] > 0 && possibilities[0] > 3) || // [4, 1, 1, 1]
            (possibilities[2] > 1 && possibilities[0] > 2) || // [3, 3, 1]
            (possibilities[2] > 0 && possibilities[1] > 2) || // [3, 2, 2]
            (possibilities[2] > 0 &&
                possibilities[1] > 1 &&
                possibilities[0] > 3) || // [3, 2, 1, 1]
            (possibilities[1] > 2 && possibilities[0] > 3)
        ); // [2, 2, 2, 1]
    }

    updateMarbleLocations(p: number, nOld: number, nNew: number) {
        const marbleIndex = this.marbleLocations[p].indexOf(nOld);
        if (marbleIndex === -1) {
            console.error(
                `Failed to update marble from player ${p} from ${nOld} to ${nNew}`
            );
            return;
        }
        this.marbleLocations[p][marbleIndex] = nNew;
    }

    /**
     * Clears a position on the board and returns any marble on it back to the
     * base of the respective player.
     *
     * @param n - The node to be cleared
     * @param force - Clear even blocking marbles
     */
    clearNode(n: number, force: boolean = false) {
        // p indicates the player whose marble is on n, if there is one
        let p = null;
        if (this.isRegularIndex(n)) {
            if (this.nodes[n] < this.nPlayers) {
                // the new position was occupied by a marble of a player
                p = this.nodes[n];
            } else if (
                this.nodes[n] >= 10 &&
                this.nodes[n] < 10 + this.nPlayers
            ) {
                // the new position was occupied by a blocking marble
                if (force) {
                    p = this.nodes[n] - 10;
                } else {
                    console.warn(
                        `Try to clear blocking node ${n} occupied by 
                        ${this.nodes[n]} without specifying 'force' parameter`
                    );
                    return;
                }
                this.nodes[n] = this.nPlayers;
            }
        } else {
            const endzoneIndex = this.indexToEndzoneIndex(n);
            if (endzoneIndex === null) {
                console.warn(`Invalid endzone index ${n}`);
                return;
            } else if (!force) {
                console.warn(
                    `Try to clear endzone node ${n} without specifying 'force' parameter`
                );
                return;
            }
            // check if the players endzone node is occupied
            if (this.playerInfo[endzoneIndex[0]].endzone[endzoneIndex[1]]) {
                p = endzoneIndex[0];
            }
        }

        if (p !== null) {
            this.playerInfo[p].base++;
            this.updateMarbleLocations(p, n, -1);
        }
    }
    /**
     * Sets the marble from player to position n.
     *
     * @param p - The player index
     * @param m - The marble index
     * @param n - The node index
     */
    setMarble(p: number, m: number, n: number) {
        if (this.marbleLocations[p][m] === -1) {
            // the marble is in the base
            this.playerInfo[p].base--;
        }

        // forcibly remove any marble on this node
        this.clearNode(n, true);

        if (this.isRegularIndex(n)) {
            this.nodes[n] = p;
        } else {
            const endzoneIndex = this.indexToEndzoneIndex(n);
            if (endzoneIndex && endzoneIndex[0] === p) {
                this.playerInfo[p].endzone[endzoneIndex[1]] = true;
            } else {
                console.error("Index is invalid");
                return;
            }
        }
        this.marbleLocations[p][m] = n;
    }

    toObject() {
        return {
            nPlayers: this.nPlayers,
            nodes: this.nodes,
            playerInfo: this.playerInfo,
        };
    }

    static fromObject(board: {
        nPlayers: number;
        nodes: number[];
        playerInfo: { endzone: boolean[]; base: number }[];
    }) {
        // create a new board based on the settings passed as an object
        let newBoard = new Board(board.nPlayers);
        newBoard.nodes = board.nodes;
        newBoard.playerInfo = board.playerInfo;

        return newBoard;
    }
}
