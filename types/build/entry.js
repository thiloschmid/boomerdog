"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePhase = void 0;
var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["Waiting"] = 0] = "Waiting";
    GamePhase[GamePhase["Swapping"] = 1] = "Swapping";
    GamePhase[GamePhase["Playing"] = 2] = "Playing";
    GamePhase[GamePhase["WaitingForSevenMove"] = 3] = "WaitingForSevenMove";
    GamePhase[GamePhase["Finalizing"] = 4] = "Finalizing";
})(GamePhase || (GamePhase = {}));
exports.GamePhase = GamePhase;
//# sourceMappingURL=entry.js.map