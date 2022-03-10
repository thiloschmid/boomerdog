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

import { computePartitions } from "../utils.js";

// encode moving over nodes with a seven card by adding SEVEN_MOVE_OFFSET to
// the node index
export const SEVEN_MOVE_OFFSET = 1000;
export const SWAP_MOVE_OFFSET = 300; // same for swaps

export default class Board {
    nPlayers: number;
    nNodes: number;
    nodes: number[];

    endzones: boolean[][];

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

        this.endzones = Array.from({ length: nPlayers }, (e) => [
            false,
            false,
            false,
            false,
        ]);

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
        const w = n - 100;
        let m = w % 10;
        if (m > 3) {
            return null;
        }
        return [Math.floor(w / 10), m];
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
    computeMoveNodes(
        origin: number,
        destination: number,
        moveBackwards: boolean = false
    ): number[] {
        if (origin === destination) {
            return [];
        }
        if (origin >= 100 && destination - origin > 0) {
            return [...Array(destination - origin).keys()].map(
                (i) => origin + i + 1
            );
        }
        if (destination >= 100) {
            // try to enter the endzone
            const p = Math.floor((destination - 100) / 10);

            const distance = ((destination - 100) % 10) + 1; // gives 2 for 101 etc.

            const endzoneNodes = [...Array(distance).keys()].map(
                (i) => 100 + 10 * p + i
            );

            return [...this.computeMoveNodes(origin, 16 * p), ...endzoneNodes];
        }
        if (!moveBackwards) {
            const length =
                destination > origin
                    ? destination - origin
                    : destination + this.nNodes - origin;
            return [...Array(length).keys()].map(
                (i) => (origin + i + 1) % this.nNodes
            );
        } else {
            const length =
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
     *
     * @param p - The player
     * @param n - The node
     * @returns The distance to the entry node, i.e. the node where the player
     *          goes out and can enter the endzone. It returns negative values
     *          for marbles already in the endzone.
     */
    getDistanceToEntryNode(p: number, n: number) {
        if (this.isRegularIndex(n)) {
            return (p * 16 + this.nNodes - n) % this.nNodes;
        }

        const endzoneIndex = this.indexToEndzoneIndex(n);
        if (!endzoneIndex || p !== endzoneIndex[0]) {
            return null;
        }
        return -endzoneIndex[1] - 1;
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
        // check if the node is blocking and can therefore not enter the endzone
        if (this.nodes[n] === 10 + p) {
            return null;
        }
        const distance = this.getDistanceToEntryNode(p, n);
        if (distance !== null) {
            const difference = move - distance;
            if (difference > 0 && difference <= 4) {
                return 100 + 10 * p + difference - 1;
            }
        }

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
            if (this.isRegularIndex(n) && this.nodes[n] > this.nPlayers) {
                return false;
            }
            const endzoneIndex = this.indexToEndzoneIndex(n);
            if (
                endzoneIndex &&
                this.endzones[endzoneIndex[0]][endzoneIndex[1]]
            ) {
                return false;
            }
        }
        return true;
    }

    computeCollateral(p: number, nodeIndices: number[], sevenPlayed: boolean) {
        let collateral = 0;

        if (!sevenPlayed) {
            nodeIndices = [nodeIndices[nodeIndices.length - 1]];
        }
        for (let n of nodeIndices) {
            if (this.isRegularIndex(n)) {
                const nodeOccupation = this.nodes[n];
                if (nodeOccupation < this.nPlayers) {
                    p === nodeOccupation ||
                    p === (nodeOccupation + 2) % this.nPlayers
                        ? collateral--
                        : collateral++;
                }
            }
        }
        return collateral;
    }

    /**
     *
     * @param p - The player index
     * @param n - The node index
     * @param move - The requested move
     * @param remainder - If 7 is played to enter the endzone, specify how many
     * moves the player must be able to complete after entering the endzone
     * @returns - An array of the nodes which are reachable by the given move,
     * or `null` if it is not possible to reach.
     */
    getPossibleDestinations(
        p: number,
        m: number,
        move: number,
        remainder?: number
    ): { nodes: number[]; collateral?: number }[] {
        const n = this.marbleLocations[p][m];
        let sevenPlayed = false;
        let distance;
        switch (move) {
            // handle going out
            case 0:
                if (n === -1 && this.canGoOut(p)) {
                    return [
                        {
                            nodes: [-1, p * 16],
                            collateral: +(this.nodes[p * 16] < this.nPlayers),
                        },
                    ];
                } else {
                    return [];
                }

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
                if (this.isRegularIndex(n) && this.nodes[n] < this.nPlayers) {
                    return this.getSwitchCandidates(p).map((node) => ({
                        nodes: [node + SWAP_MOVE_OFFSET],
                    }));
                } else {
                    return [];
                }

            case 71:
            case 72:
            case 73:
            case 74:
            case 75:
            case 76:
            case 77:
                sevenPlayed = true;
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

        let moves: { nodes: number[]; collateral?: number }[] = [];

        // node that would be reached if not entering the endzone
        // if the node is already in the endzone, null is returned
        let destination = this.getDestination(n, distance);

        if (destination !== null) {
            const moveNodes = this.computeMoveNodes(
                n,
                destination,
                distance < 0
            );
            if (this.isReachable(p, moveNodes)) {
                if (sevenPlayed) {
                    if (typeof remainder === "undefined") {
                        console.warn("No remainder specified for seven move!");
                        return moves;
                    }
                    if (this.playerCanCompleteN(remainder, p, m)) {
                        // encode that marbles on the way are blasted by adding an offset
                        moves.push({
                            nodes: moveNodes.map(
                                (node) => SEVEN_MOVE_OFFSET + node
                            ),
                            collateral: this.computeCollateral(
                                p,
                                moveNodes,
                                true
                            ),
                        });
                    }
                } else {
                    moves.push({
                        nodes: moveNodes,
                        collateral: this.computeCollateral(p, moveNodes, false),
                    });
                }
            }
        }

        // check if entering the endzone is possible
        let endzoneDestination = this.getEndzoneDestination(p, n, distance);

        if (endzoneDestination !== null && distance > 0) {
            const moveNodes = this.computeMoveNodes(
                n,
                endzoneDestination,
                false
            );
            if (this.isReachable(p, moveNodes)) {
                if (sevenPlayed) {
                    if (typeof remainder === "undefined") {
                        console.warn("No remainder specified for seven move!");
                        return moves;
                    }
                    if (
                        remainder &&
                        !this.playerCanCompleteN(remainder, p, m)
                    ) {
                        console.debug(
                            `Player can't complete ${remainder} moves when entering the endzone`
                        );

                        const stepsToFinish = this.stepsToFinish(p);
                        if (
                            stepsToFinish === null ||
                            stepsToFinish > distance + remainder
                        ) {
                            console.debug("Player can't finish either");
                            return moves;
                        } else {
                            // the player can finish
                            if (
                                !this.playerCanCompleteN(
                                    distance + remainder - stepsToFinish,
                                    (p + this.nPlayers / 2) % this.nPlayers
                                )
                            ) {
                                console.debug(
                                    `Player can finish but his teammate can't complete ${
                                        remainder - stepsToFinish
                                    }`
                                );
                                return moves;
                            }
                        }
                    }

                    moves.push({
                        nodes: moveNodes.map(
                            (node) => SEVEN_MOVE_OFFSET + node
                        ),
                        collateral: this.computeCollateral(p, moveNodes, true),
                    });
                } else {
                    // for everything other than a seven it is trivial
                    moves.push({ nodes: moveNodes });
                }
            }
        }

        return moves;
    }

    executeMove(p: number, m: number, move: number[]) {
        const nOld = this.marbleLocations[p][m];

        // check if going out
        if (move[0] === -1) {
            if (nOld !== -1) {
                console.warn(`Tried going out with marble not in base`);
                return;
            }
            let outIndex = 16 * p;
            // clear any marble
            this.clearNode(outIndex);

            // set the marble to its new blocking position
            this.nodes[outIndex] = 10 + p;
            this.marbleLocations[p][m] = outIndex;
            return;
        }
        if (move[0] >= SWAP_MOVE_OFFSET && move[0] < SEVEN_MOVE_OFFSET) {
            // switch
            const nSwip = this.marbleLocations[p][m];
            const nSwap = move[0] - SWAP_MOVE_OFFSET;
            const pSwap = this.nodes[nSwap];
            // find mSwap
            const mSwap = this.marbleLocations[pSwap].indexOf(nSwap);

            // update marbleLocations
            this.marbleLocations[p][m] = nSwap;
            this.marbleLocations[pSwap][mSwap] = nSwip;

            // update nodes
            this.nodes[nSwap] = p;
            this.nodes[nSwip] = pSwap;
            return;
        }
        if (move[0] >= SEVEN_MOVE_OFFSET) {
            // walking with a seven

            move = move.map((n) => n - SEVEN_MOVE_OFFSET);
            for (let n of move) {
                this.isRegularIndex(n) && this.clearNode(n);
            }
        } else {
            this.isRegularIndex(move[move.length - 1]) &&
                this.clearNode(move[move.length - 1]);
        }

        /* clear the old position */
        if (this.isRegularIndex(nOld)) {
            this.nodes[nOld] = this.nPlayers;
        } else {
            const endzoneIndex = this.indexToEndzoneIndex(nOld);
            if (endzoneIndex) {
                this.endzones[endzoneIndex[0]][endzoneIndex[1]] = false;
            } else {
                console.error(`Invalid index`);
            }
        }

        const nNew = move[move.length - 1];

        if (this.isRegularIndex(nNew)) {
            // put the new marble into that position
            this.nodes[nNew] = p;
        } else {
            // put the marble into the endzone
            const endzoneIndex = this.indexToEndzoneIndex(nNew);
            if (endzoneIndex) {
                this.endzones[endzoneIndex[0]][endzoneIndex[1]] = true;
            } else {
                console.error(`Invalid index`);
            }
        }

        // update marbleLocations
        this.marbleLocations[p][m] = move[move.length - 1];
    }

    /**
     *
     * @param p - The number of the exiting player
     * @returns - If the player can go out
     */
    canGoOut(p: number): boolean {
        // verify that entry node is not occupied by own blocking marble
        return this.nodes[16 * p] !== 10 + p;
    }

    getSwitchCandidates(p: number) {
        const switchCandidates = [];
        for (let p2 = 0; p2 < this.nPlayers; p2++) {
            if (p === p2) {
                continue;
            }
            for (let m = 0; m < 4; m++) {
                const n = this.marbleLocations[p2][m];
                if (this.isRegularIndex(n) && this.nodes[n] === p2) {
                    switchCandidates.push(n);
                }
            }
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

    playerCanMove(p: number, move: number, excludedMarble?: number) {
        for (let m = 0; m < 4; m++) {
            if (m === excludedMarble) {
                continue;
            }
            if (this.getPossibleDestinations(p, m, move).length) {
                return true;
            }
        }
        return false;
    }

    // playerCanCompleteSeven(p: number) {
    //     // ⚠️ legacy
    //     // 💁 it is not necessary to check if the player can finish and then
    //     // continue with his teammate's marbles as he can always walk past
    //     // the endzone

    //     if (this.playerCanMove(p, 77)) {
    //         return true;
    //     }
    //     let possibilities = Array(6).fill(0);
    //     for (let j = 5; j >= 0; j--) {
    //         for (let m = 0; m < 4; m++) {
    //             if (this.getPossibleDestinations(p, m, j + 1).length) {
    //                 possibilities[j]++;
    //             }
    //         }
    //     }

    //     return (
    //         (possibilities[5] > 0 && possibilities[0] > 1) || // [6, 1]
    //         (possibilities[4] > 0 && possibilities[1] > 1) || // [5, 2]
    //         (possibilities[4] > 0 && possibilities[0] > 2) || // [5, 1, 1]
    //         (possibilities[3] > 0 && possibilities[2] > 1) || // [4, 3]
    //         (possibilities[3] > 0 &&
    //             possibilities[1] > 1 &&
    //             possibilities[0] > 2) || // [4, 2, 1]
    //         (possibilities[3] > 0 && possibilities[0] > 3) || // [4, 1, 1, 1]
    //         (possibilities[2] > 1 && possibilities[0] > 2) || // [3, 3, 1]
    //         (possibilities[2] > 0 && possibilities[1] > 2) || // [3, 2, 2]
    //         (possibilities[2] > 0 &&
    //             possibilities[1] > 1 &&
    //             possibilities[0] > 3) || // [3, 2, 1, 1]
    //         (possibilities[1] > 2 && possibilities[0] > 3)
    //     ); // [2, 2, 2, 1]
    // }

    playerCanCompleteN(distance: number, p: number, excludedMarble?: number) {
        // for distance = 3, this would be [[3], [2, 1], [1,1,1]]
        // note that its in descending order
        if (distance === 0) {
            return true;
        }

        const partitions = computePartitions(distance);

        for (const partition of partitions) {
            // for each partiton compute possibilities to complete

            // console.log(partition)

            const highestValue = partition[0];
            const sum = Array(highestValue).fill(0);
            for (const val of partition) {
                // for the above example this yields [0,0,1], [1,1,0], and [3]
                sum[val - 1]++;
            }
            let partitionWorks = true;
            for (let i = 0; i < sum.length; i++) {
                // iterate through the values in sum: for the i'th value have
                // to check if sum[i] possibilities exist to move (i+1). For
                // instance, if sum[2] = 2, have to check if at least two
                // marbles can move 3. Similarly, sum[0] = 3 corresponds to
                // 4 marbles being able to move 1.
                let possibilities = 0;
                for (let m = 0; m < 4; m++) {
                    // iterate through marbles, ignoring the excluded one
                    if (m === excludedMarble) {
                        continue;
                    }
                    // raise possibilities if there is a possible destination
                    this.getPossibleDestinations(p, m, i + 1).length &&
                        possibilities++;
                }
                if (possibilities < sum[i]) {
                    // it does not work
                    partitionWorks = false;
                }
            }
            if (partitionWorks) {
                return true;
            }
        }
        return false;
    }

    stepsToFinish(p: number): number | null {
        if (this.marbleLocations[p].includes(-1)) {
            // a marble is still in base
            return null;
        }
        // steps to reach final node in the endzone
        let steps = 0;
        let marblesFound = 0;

        // compute the steps required to fill the endzone assuming the marbles
        // are stacked optimally in front of the endzone
        // 🔴,🔴|🔴,🔴,_,_| => 8 (two moves per marble to fill the endzone)
        // 🔴|🔴,🔴,🔴,_| => 4
        // 🔴,🔴|_,🔴,🔴,_| => 6
        //
        // It can be seen that the value corresponds to the result of summing
        // the number of marbles to the left of each unoccupied endzone node
        for (let i = 0; i < 4; i++) {
            // iterate through endzone in reverse direction
            const endzoneNode = this.endzones[p][3 - i];
            if (endzoneNode) {
                marblesFound++;
            } else {
                steps += 4 - marblesFound;
            }
        }

        let marblesOut = 0;
        for (const n of this.marbleLocations[p]) {
            // established before that none are still in base
            if (this.isRegularIndex(n)) {
                const distance = this.getDistanceToEntryNode(p, n);
                if (distance !== null) {
                    steps += distance - marblesOut; //
                }
                marblesOut++;
            }
        }

        return steps;
    }

    /**
     * Clears a position on the board and returns any marble on it back to the
     * base of the respective player.
     *
     * @param n - The node to be cleared
     * @param force - Clear even blocking marbles or marbles in the endzone
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
            if (this.endzones[endzoneIndex[0]][endzoneIndex[1]]) {
                p = endzoneIndex[0];
            }
        }

        if (p !== null) {
            this.updateMarbleLocations(p, n, -1);
        }
    }

    /**
     *
     * @param p - The player
     * @param nOld - The original node of the marble
     * @param nNew - The new node of the marble
     */
    updateMarbleLocations(p: number, nOld: number, nNew: number): void {
        const marbleIndex = this.marbleLocations[p].indexOf(nOld);
        if (marbleIndex === -1) {
            console.error(
                `Failed to update marble from player ${p} from ${nOld} to ${nNew}`
            );
            return;
        }
        this.marbleLocations[p][marbleIndex] = nNew;
    }

    /* ⏩ Debugging functions */

    /**
     * Sets the marble from player to position n.
     *
     * @param p - The player index
     * @param m - The marble index
     * @param n - The node index
     */
    setMarble(p: number, m: number, n: number) {
        // forcibly remove any marble on this node
        this.clearNode(n, true);

        if (this.isRegularIndex(n)) {
            this.nodes[n] = p;
        } else {
            const endzoneIndex = this.indexToEndzoneIndex(n);
            if (endzoneIndex && endzoneIndex[0] === p) {
                this.endzones[endzoneIndex[0]][endzoneIndex[1]] = true;
            } else {
                console.error("Index is invalid");
                return;
            }
        }
        this.marbleLocations[p][m] = n;
    }
}
