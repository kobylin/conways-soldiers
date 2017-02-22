'use strict';

const boardWidth = 80,
      boardHeight = 10;

const EMPTY = 0,
    SOLDIER = 1,
    TURN_UP = 'up',
    TURN_DOWN = 'down',
    TURN_LEFT = 'left',
    TURN_RIGHT = 'right';

const board = getInitBoard(boardWidth, boardHeight);

doTurnSequence(board)

function getInitBoard(boardWidth, boardHeight) {
    let board = [];
    const boardMiddle = Math.ceil(boardHeight/2);

    for(let i = 0; i < boardHeight; i++) {
        board.push(Array(boardWidth).fill(i < boardMiddle ? EMPTY : SOLDIER ))
    }

    return board;
}

function doTurnSequence(board) {
    let currentBoard = board;
    let bestTurn = getFirstBestTurn(currentBoard);
    let step = 1;

    while (bestTurn) {
        let nextBoard = doSoldierTurn(currentBoard, bestTurn);
        printBoard(nextBoard);
        console.log(step);
        if(equals(currentBoard, nextBoard)) {
            console.log('EQYALS!');
            debugger;
        }
        currentBoard = nextBoard;
        bestTurn = getFirstBestTurn(currentBoard);
        step++;
        // sleep(0.1);
    }

}

function getAllTurnsWithScore(board) {
    let availableTurns = getAvailableTurnsOnBoard(board);
    let turnsWithScores = [];
    availableTurns.forEach((row, rowIdx) => {
        row.forEach((turn, elementIdx) => {
            let turnScore = {};
            for(let direction in turn) {
                if(turn[direction]) {
                    turnScore[direction] = getScoreOnBoard(doSoldierTurn(board, {
                        rowIdx,
                        elementIdx,
                        turn: { direction: direction }
                    }));
                }
            }
            if(hasProps(turnScore)) {
                turnsWithScores.push({
                    rowIdx,
                    elementIdx,
                    scores: turnScore
                });
            }
        });
    });

    return turnsWithScores;
}

function getBestTurn(turns) {
    if(!turns.length) return null;

    const sortedTurns = turns.map(turn => {
        var bestDirection = getMaxProperty(turn.scores);
        return Object.assign({}, turn, {
            bestDirection: getBestDirection(turn)
        });
    }).sort((turnA, turnB) => {
        return turnB.bestDirection.score - turnA.bestDirection.score;
    });

    sortedTurns[0].turn = sortedTurns[0].bestDirection;
    return sortedTurns[0];
}

function getBestDirection (turn) {
    var bestDirection = getMaxProperty(turn.scores);

    return {
        direction: bestDirection.name,
        score: bestDirection.value
    };
}

function getFirstBestTurn(board) {
    return getBestTurn(getAllTurnsWithScore(board));
}

function getBestTurn2(board) {
    const turns1 = getAllTurnsWithScore(board);
    if (!turns1.length) return null;

    const turns1Scores = [];

    turns1.forEach((turn, turnIdx) => {
        let score = 0;

        turn.turn = getBestDirection(turn);
        let nextBoard = doSoldierTurn(board, turn);
        score += getScoreOnBoard(nextBoard);

        let bestTurn = getFirstBestTurn(nextBoard);
        if (bestTurn) {
            nextBoard = doSoldierTurn(nextBoard, bestTurn);
            score += getScoreOnBoard(nextBoard);
        }

        turns1Scores.push({turnIdx, score});
    });

    const bestIdx = turns1Scores.sort((a,b) => b.score - a.score)[0].turnIdx;
    return turns1[bestIdx];
}

function doSoldierTurn(originBoard, turn) {
    let board = cloneArray(originBoard),
        { rowIdx, elementIdx, turn: {direction: direction} } = turn;

    try {
        if(direction === TURN_UP) {
            let canDo = board[rowIdx][elementIdx] === EMPTY &&
                board[rowIdx + 1] && board[rowIdx + 1][elementIdx] === SOLDIER &&
                board[rowIdx + 2] && board[rowIdx + 2][elementIdx] === SOLDIER;

            if(!canDo) throw 'Wrong turn';

            board[rowIdx][elementIdx] = SOLDIER;
            board[rowIdx + 1][elementIdx] = EMPTY;
            board[rowIdx + 2][elementIdx] = EMPTY;
        }
        if(direction === TURN_DOWN) {
            let canDo = board[rowIdx][elementIdx] === EMPTY &&
                board[rowIdx - 1] && board[rowIdx - 1][elementIdx] === SOLDIER &&
                board[rowIdx - 2] && board[rowIdx - 2][elementIdx] === SOLDIER;

            if(!canDo) throw 'Wrong turn' ;

            board[rowIdx][elementIdx] = SOLDIER;
            board[rowIdx - 1][elementIdx] = EMPTY;
            board[rowIdx - 2][elementIdx] = EMPTY;
        }
        if(direction === TURN_LEFT) {
            let canDo = board[rowIdx][elementIdx] === EMPTY &&
                board[rowIdx][elementIdx + 1] === SOLDIER &&
                board[rowIdx][elementIdx + 2] === SOLDIER;

            if(!canDo) throw 'Wrong turn';

            board[rowIdx][elementIdx] = SOLDIER;
            board[rowIdx][elementIdx + 1] = EMPTY;
            board[rowIdx][elementIdx + 2] = EMPTY;
        }
        if(direction === TURN_RIGHT) {
            let canDo = board[rowIdx][elementIdx] === EMPTY &&
                board[rowIdx][elementIdx - 1] === SOLDIER &&
                board[rowIdx][elementIdx - 2] === SOLDIER;

            if(!canDo) throw 'Wrong turn';

            board[rowIdx][elementIdx] = SOLDIER;
            board[rowIdx][elementIdx - 1] = EMPTY;
            board[rowIdx][elementIdx - 2] = EMPTY;
        }
    } catch (e) {
        throw 'Wrong turn: rowIdx, elementIdx, direction' + [rowIdx, elementIdx, direction].join(',');
    }

    return board;
}

function getSoldiersAvailableTurns(board) {
    let turns = [];
    board.forEach((row, rowIdx) => {
        row.forEach((element, elementIdx) => {
            let canMakeTurnRight = element === SOLDIER && row[elementIdx + 1] === SOLDIER && row[elementIdx + 2] === EMPTY;
            let canMakeTurnLeft = element === SOLDIER && row[elementIdx - 1] === SOLDIER && row[elementIdx - 2] === EMPTY;
            let canMakeTurnUp = element === SOLDIER &&
                board[rowIdx - 1] && board[rowIdx - 1][elementIdx] === SOLDIER &&
                board[rowIdx - 2] && board[rowIdx - 2][elementIdx] === EMPTY;
            let canMakeTurnDown = element === SOLDIER &&
                board[rowIdx + 1] && board[rowIdx + 1][elementIdx] === SOLDIER &&
                board[rowIdx + 2] && board[rowIdx + 2][elementIdx] === EMPTY;

            if(!turns[rowIdx]) turns[rowIdx] = [];

            turns[rowIdx][elementIdx] = {
                right: canMakeTurnRight,
                left: canMakeTurnLeft,
                up: canMakeTurnUp,
                down: canMakeTurnDown
            };
        });
    });

    return turns;
}

function getAvailableTurnsOnBoard(board) {
    let turns = [];
    board.forEach((row, rowIdx) => {
        row.forEach((element, elementIdx) => {
            let left = element === EMPTY && row[elementIdx + 1] === SOLDIER && row[elementIdx + 2] === SOLDIER;
            let right = element === EMPTY && row[elementIdx - 1] === SOLDIER && row[elementIdx - 2] === SOLDIER;
            let down = element === EMPTY &&
                board[rowIdx - 1] && board[rowIdx - 1][elementIdx] === SOLDIER &&
                board[rowIdx - 2] && board[rowIdx - 2][elementIdx] === SOLDIER;
            let up = element === EMPTY &&
                board[rowIdx + 1] && board[rowIdx + 1][elementIdx] === SOLDIER &&
                board[rowIdx + 2] && board[rowIdx + 2][elementIdx] === SOLDIER;

            if(!turns[rowIdx]) turns[rowIdx] = [];

            turns[rowIdx][elementIdx] = {
                [TURN_RIGHT]: !!right,
                [TURN_LEFT]: !!left,
                [TURN_UP]: !!up,
                [TURN_DOWN]: false // !!down
            };
        });
    });

    return turns;
}

function getScoreOnBoard(board) {
    let score = 0;
    board.forEach((row, rowIdx) => {
        row.forEach((element, elementIdx) => {
            const sRow = board.length - rowIdx;
            score += (element === SOLDIER ? 1 : 0) * sRow;
        });
    });

    return score;
}

function printBoard(board) {
    board.forEach((row, idx) => {
        console.log(padLeft(idx, 4, ' ') + ':', row.join('|'));
    });
}

function padLeft(number, totalChars, str){
    return Array(totalChars - String(number).length + 1).join(str || '0') + number;
}

function sleep(seconds) {
    let waitTill = new Date(new Date().getTime() + seconds * 1000);
    while(waitTill > new Date()){}
}

function cloneArray(arr) {
    let cloned = [];
    arr.forEach(item => {
        if(isArray(item)) {
            cloned.push(cloneArray(item));
        } else {
            cloned.push(item);
        }
    });

    return cloned;
}

function isArray(obj) {
    return getTypeName(obj) === 'Array';
}

function isObject(obj) {
    return getTypeName(obj) === 'Object';
}

function getTypeName(obj) {
    return /\[.+ (.+)\]/.exec(Object.prototype.toString.call(obj))[1];
}

function hasProps(obj) {
    for(let p in obj) {
        return true;
    }

    return false;
}

function getMaxProperty(obj) {
    let name;
    let value;

    for (let p in obj) {
        if (!name) {
            name = p;
            value = obj[p];
        } else {
            if (value < obj[p]) {
                value = obj[p];
                name = p;
            }
        }
    };

    return {name, value};
}

function equals(obj1, obj2) {
    if(!isArray(obj1) && !isObject(obj1)) {
        return obj1 === obj2;
    }

    let allEquals = true;
    for (let prop in obj1) {
        if (obj1.hasOwnProperty(prop)) {
            allEquals = allEquals && equals(obj1[prop], obj2[prop]);
        }
    }

    return allEquals;
}
