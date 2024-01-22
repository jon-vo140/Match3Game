export default class Board {
    constructor(state, rows, cols, blockVariations, debug = false) {
        this.state = state;
        this.rows = rows;
        this.cols = cols;
        this.blockVariations = blockVariations;
        this.debug = debug;

        this.grid = [];
        this.reserveGrid = [];

        for (let i = 0; i < rows; i++) {
            this.grid.push([]); 
            this.reserveGrid.push([]); 
        }

        this.populateGrid();
        this.populateReserveGrid();
    }

    populateGrid() {
        this.grid = [];
        for (let i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                const variation = Math.floor(Math.random() *this.blockVariations) + 1;
                this.grid[i].push(variation); 
            }
        }
    }

    populateReserveGrid() {
        this.reserveGrid = [];
        for (let i = 0; i < this.rows; i++) {
            this.reserveGrid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                const variation = Math.floor(Math.random() *this.blockVariations) + 1;
                this.reserveGrid[i].push(variation);
            }
        }
    }

    consoleLog() {
        if (this.debug) {
            let prettyString = '';
            for (let i = 0; i < this.rows; i++) {
                prettyString += '\n';
                for (let j = 0; j < this.cols; j++) {
                    prettyString += ' ' + this.reserveGrid[i][j];
                }
            }

            prettyString += '\n';
            for (let j = 0; j < this.cols; j++) {
                prettyString += '-';
            }

            for (let i = 0; i < this.rows; i++) {
                prettyString += '\n';
                for (let j = 0; j < this.cols; j++) {
                    prettyString += ' ' + this.grid[i][j];
                }
            }

            console.log(prettyString);
        }
    }

    swap(source, target) {
        const temp = this.grid[target.row][target.col];
        this.grid[target.row][target.col] = this.grid[source.row][source.col];
        this.grid[source.row][source.col] = temp;
        
        const tempPos = {
            row: source.row,
            col: source.col,
        };

        source.row = target.row;
        source.col = target.col;
        target.row = tempPos.row;
        target.col = tempPos.col;

        // this.consoleLog();
    }

    checkAdjacent(source, target) {
        const diffRow = Math.abs(source.row - target.row);
        const diffCol = Math.abs(source.col - target.col);
        const isAdjacent = (diffRow === 1 && diffCol === 0) || (diffRow === 0 && diffCol === 1);
        return isAdjacent;
    }

    isChained(block) {
        let isChained = false;
        const variation = this.grid[block.row][block.col];
        const { row, col } = block;

        // check left 
        if (variation === this.grid[row][col - 1] && variation === this.grid[row][col - 2]) {
            isChained = true;
        }

        // check right 
        if (variation === this.grid[row][col + 1] && variation === this.grid[row][col + 2]) {
            isChained = true;
        }

        // check up
        if (this.grid[row - 2]){
            if (variation === this.grid[row - 1][col] && variation === this.grid[row - 2][col]) {
                isChained = true;
            }
        }

        // check down 
        if (this.grid[row + 2]){
            if (variation === this.grid[row + 1][col] && variation === this.grid[row + 2][col]) {
                isChained = true;
            }
        }

        // check center - horizontal
        if (variation === this.grid[row][col - 1] && variation === this.grid[row][col +1]) {
            isChained = true;
        }

        // check center - vertical 
        if (this.grid[row - 1] && this.grid[row + 1]) {
            if (variation === this.grid[row - 1][col] && variation === this.grid[row + 1][col]) {
                isChained = true;
            }
        }
        return isChained;
    }

    findAllChains() {
        const chained = [];

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.isChained({
                    row: i,
                    col: j,
                })) {
                    chained.push({
                        row: i,
                        col: j,
                    });
                }
            }
        }
        return chained;
    }

    clearChains() {
        // get all grid blocks that need to be cleared 
        const chainedBlocks = this.findAllChains();

        chainedBlocks.forEach((block) => {
            // set grid blocks to zero
            this.grid[block.row][block.col] = 0;

            // destroy sprites
            this.state.getBlockFromColRow(block).kill();

        });
        // this.consoleLog();
    }

    dropBlock(sourceRow, targetRow, col) {
        // drop grid blocks
        this.grid[targetRow][col] = this.grid[sourceRow][col];
        this.grid[sourceRow][col] = 0;

        // drop sprites
        this.state.dropBlock(sourceRow, targetRow, col);
    }

    dropReserveBlock(sourceRow, targetRow, col) {
        // drop blocks from reserve grid
        this.grid[targetRow][col] = this.reserveGrid[sourceRow][col];
        this.reserveGrid[sourceRow][col] = 0;

        // draw new sprite 
        this.state.dropReserveBlock(sourceRow, targetRow, col);
    }

    updateGrid() {
        for (let i = this.rows - 1; i >= 0; i--) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j] === 0) {
                    let foundBlock = false;

                    for (let k = i - 1; k >= 0; k--) {
                        if (this.grid[k][j] > 0) {
                            foundBlock = true;
                            this.dropBlock(k, i, j);
                            break;
                        }
                    }

                    if (!foundBlock) {
                        for (let k = this.rows - 1; k >= 0; k--) {
                            if (this.reserveGrid[k][j] > 0) {
                                this.dropReserveBlock(k, i, j);
                                break;
                            }
                        }
                    }
                }
            }
        }

        this.populateReserveGrid();
        // this.consoleLog();
    }
}

 
