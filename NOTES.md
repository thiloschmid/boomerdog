# BoomerDog

## Cards & Moves

The cards are

-   **2, 3, 5, 6, 8, 9, 10, 12** with **12** being a queen. They just have the corresponding regular move.
-   **4** has the moves **+4** or **-4**
-   **7** has the moves **71, 72, ..., 77** corresponding to walking 1 to 7 with a seven card
-   **11** is the ace and has the moves **1, 11, 0** with **0** meaning going out
-   **13** is a king and has the moves **13, 0**
-   **14** is a joker and has all of the above moves

### Receiving a move request

If the client sends a request for a certain move,

## Board class

In the following, only the four player board is described.

### Node

There are three kinds of nodes:

-   Regular nodes, where all marbles can go. They are indexed by the numbers 0 to 63
-   Base nodes, which belong to a player and is the starting position for a player's marble. They all have the index -1, as their order does not matter.
-   Endzone nodes, which players aim to reach to complete the game. Their indices take the values `100-103` for player `0`, the values `110-113`, for player `1`, etc.

### Variable names

The relevant quantities in the methods are

-   **Nodes** `n` $\in \{0,1,...,63\} \cup \{-1\} \cup \{100, ... , 103\} \cup ... \cup \{130, ... , 133\}$ corresponding to regular, base, and endzone nodes.
-   **Player** `p` $\in \{0, 1, 2, 3\}$
-   **Marble** `m` $\in \{0,1,2,3\}$ corresponds to the index of the marble. Therefore, a marble is only well-defined if `p` is known.
-   **Card** `c` $\in \{0,1,..., n_c\}$ where $n_c$ is the number of cards which have been dealt at the start of the round

## PossibleMoves

The possible moves are encoded in an $6 \times 4 \times x$ (cards $\times$ marbles $\times$ moves) array.

-   If the card is a regular move card (e.g. a '3') the move contains the whole path of length 3 to the target node. For instance moving 3 with a marble at 20 yields [21, 22, 23]

-   If walking forward with a 7, 1000 is added, i.e. walking 3 forward with a 7 starting at 20 yields [1021, 1022, 1023]

-   Going out is [-1, player-specific out node]
-   Swapping with a marble on node n is encoded as 300+n, i.e. swapping with a node at n=23 is [323]

## Cards

| Value | Card     | Possible Moves                                                            |
| ----: | -------- | ------------------------------------------------------------------------- |
|     0 | 🃏 joker | 0, 1, 2, 3, 4, 5, 6, 71, 72, 73, 74, 75, 76, 77, 8, 9, 10, 11, 12, 13, 14 |
|     1 | 🅰️       | 0, 1, 11                                                                  |
|     2 | 2️⃣       | 2                                                                         |
|     3 | 3️⃣       | 3                                                                         |
|     4 | 4️⃣       | 4, -4                                                                     |
|     5 | 5️⃣       | 5                                                                         |
|     6 | 6️⃣       | 6                                                                         |
|     7 | 7️⃣       | 71, 72, 73, 74, 75, 76, 77                                                |
|     8 | 8️⃣       | 8                                                                         |
|     9 | 9️⃣       | 9                                                                         |
|    10 | 10       | 10                                                                        |
|    11 | jack 👦  | 14 (swap)                                                                 |
|    12 | queen    | 12                                                                        |
|    13 | king 👑  | 0, 13                                                                     |

## Backend API

There are three different quantities related to the game's state:

-   **GameData** contains information which is set before the game and remains the same during the course of the game. For example the order of the players.
-   **GameState** is defined during the game and includes quantities which vary during the game, e.g. the active player index.
-   **GamePhase** describes if the players are swapping cards, or playing cards / performing moves.

## Tests

### Backend

Run

    npm test

in `boomerdog/server/`

## Authentication

For now, only [authentication through github](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps) is supported.

For development, a [proxy server](https://github.com/prose/gatekeeper) is required to bypass _CORS_ issues.
