# BoomerDog

## Cards & Moves

The cards are 
- **2, 3, 5, 6, 8, 9, 10, 12** with **12** being a queen. They just have the corresponding regular move. 
- **4** has the moves **+4** or **-4**
- **7** has the moves **71, 72, ..., 77** corresponding to walking 1 to 7 with a seven card
- **11** is the ace and has the moves **1, 11, 0** with **0** meaning going out
- **13** is a king and has the moves **13, 0**
- **14** is a joker and has all of the above moves

### Receiving a move request

If the client sends a request for a certain move, 

## Board class

In order to make a move, first the `validateMove` function has to be called. In case the move is valid, `validateMove` returns a callback function, which can be called to execute the requested move. 

The same principle also applies to the `validateSwitch` function. 

## CardsHandler class

| Value | Card | Possible Moves |
| ------------:|------|----------------|
| 0 | 🃏 joker | 0, 1, 2, 3, 4, 5, 6, 71, 72, 73, 74, 75, 76, 77, 8, 9, 10, 11, 12, 13, 14 |
| 1 | 🅰️ | 0, 1, 11 |
| 2 | 2️⃣ | 2 |
| 3 | 3️⃣ | 3 |
| 4 | 4️⃣ | 4, -4 |
| 5 | 5️⃣ | 5 |
| 6 | 6️⃣ | 6 | 
| 7 | 7️⃣ | 71, 72, 73, 74, 75, 76, 77 |
| 8 | 8️⃣ | 8 |
| 9 | 9️⃣ | 9 |
| 10 | 10 | 10 |
| 11 | jack 👦 | 14 (swap)
| 12 | queen | 12 |
| 13 | king 👑 | 0, 13 |

