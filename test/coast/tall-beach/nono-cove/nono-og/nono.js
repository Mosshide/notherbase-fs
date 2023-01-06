let tileSize = 30;

class NonoTile {
    constructor (game, $field, position, modifier) {
        this.$div = $field.append(`<div class="nono-tile" id="${position[0]},${position[1]}"></div>`).children().last();
        this.$div.css("width", tileSize);
        this.$div.css("height", tileSize);
        this.position = position;
        this.state = "blank";
        this.$div.addClass(this.state);
        this.correctState = this.getRandomState(modifier);
        this.solved = this.checkIfSolved();
        this.game = game;

        this.$div.on("click", this.clicked);
    }

    getRandomState(modifier) {
        let roll = Math.floor(Math.random() * (2 + modifier));
        if (roll < 1) return "blank";
        else return "punched";
    }

    checkIfSolved() {
        if ((this.state === "blank" || this.state === "marked") && this.correctState === "blank") return true;
        else if (this.state === "punched" && this.correctState === "punched") return true;
        else return false;
    }

    clicked = () => {
        this.$div.removeClass(this.state);

        if (this.state === "blank") this.state = "marked";
        else if (this.state === "marked") this.state = "punched";
        else if (this.state === "punched") this.state = "blank";

        this.$div.addClass(this.state);

        this.solved = this.checkIfSolved();
        this.game.tryFinishGame();
    }
}

class NonoGame {
    constructor () {
        this.difficulty = 0;
        this.level = 2;
        this.$board = $("#nono-board");
        this.$field = null;
        this.dimensions = [this.level, this.level];
        this.hints = [[], []];
        this.tiles = [];
        this.nonoSize = 100;
        this.maxNonoId = 4;
        this.goldItem = "Gold Coin";

        this.startNew();
    }

    startNew() {
        this.dimensions = [this.level, this.level];

        this.$board.empty();
        this.$board.css("width", this.dimensions[0] * (tileSize) + this.nonoSize + 5);
        this.$board.css("height", this.dimensions[1] * (tileSize) + this.nonoSize + 5);

        let $nono = this.$board.append(`<img class="nono" src="/img/logo.png">`).children().last();
        $nono.css("width", this.nonoSize);
        $nono.css("height", this.nonoSize);

        let $topHints = this.$board.append(`<div class="top hints"></div>`).children().last();
        $topHints.css("width", this.dimensions[0] * tileSize);
        $topHints.css("height", this.nonoSize);

        let $columns = [];
        for (let i = 0; i < this.dimensions[0]; i++) {
            let $newColumn = $topHints.append(`<div class="column"></div>`).children().last();
            $newColumn.css("width", tileSize);
            $columns.push($newColumn);
        }

        let $sideHints = this.$board.append(`<div class="side hints"></div>`).children().last();
        $sideHints.css("width", this.nonoSize);
        $sideHints.css("height", this.dimensions[1] * tileSize);

        let $rows = [];
        for (let i = 0; i < this.dimensions[1]; i++) {
            let $newRow = $sideHints.append(`<div class="row"></div>`).children().last();
            $newRow.css("height", tileSize);
            $rows.push($newRow);
        }

        this.$field = this.$board.append(`<div class="nono-field"></div>`).children().last();
        this.$field.css("width", this.dimensions[0] * tileSize);
        this.$field.css("height", this.dimensions[1] * tileSize);

        this.tiles = this.generateTiles();
        this.hints = this.generateHints();

        for (let i = 0; i < this.dimensions[0]; i++) {
            for (let j = 0; j < this.hints[0][i].length; j++) {
                $columns[i].append(`<p class="hint">${this.hints[0][i][j]}</p>`);
            }
        }

        for (let i = 0; i < this.dimensions[1]; i++) {
            for (let j = 0; j < this.hints[1][i].length; j++) {
                $rows[i].append(`<p class="hint">${this.hints[1][i][j]}</p>`);
            }
        }

        if (this.checkForSolve()) {
            console.log("Randomly generated nothing!");
            this.startNew();
        }
    }

    generateTiles() {
        let tiles = [];

        for (let i = 0; i < this.dimensions[0]; i++) {
            for (let j = 0; j < this.dimensions[1]; j++) {
                tiles.push(new NonoTile(
                    this, 
                    this.$field, 
                    [i, j],
                    1 - (this.difficulty / 10)
                ));
            }
        }

        return tiles;
    }

    generateHints() {
        let hints = [[], []];

        for (let i = 0; i < this.dimensions[0]; i++) {
            let current = 0;
            hints[0].push([]);

            for (let j = 0; j < this.dimensions[1]; j++) {
                if (this.tiles[j * this.dimensions[0] + i].correctState === "punched") current++;
                else if (current > 0) {
                    hints[0][i].push(current);
                    current = 0;
                }
            }

            if (current > 0 || hints[0][i].length < 1) {
                hints[0][i].push(current);
            }
        }

        for (let i = 0; i < this.dimensions[1]; i++) {
            let current = 0;
            hints[1].push([]);

            for (let j = 0; j < this.dimensions[0]; j++) {
                if (this.tiles[i * this.dimensions[0] + j].correctState === "punched") current++;
                else if (current > 0) {
                    hints[1][i].push(current);
                    current = 0;
                }
            }

            if (current > 0 || hints[1][i].length < 1) hints[1][i].push(current);
        }

        return hints;
    }

    checkForSolve() {
        let solved = true;

        for (let i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i].solved) {
                solved = false;
                break;
            }
        }

        return solved;
    }

    tryFinishGame() {
        if (this.checkForSolve()) {
            playerInventory.change(this.goldItem, this.level + this.difficulty);

            let $tiles = $(".nono-tile");
            $tiles.off("click");
            $tiles.addClass("borderless");
            $tiles = $(".nono-tile.marked");
            $tiles.addClass("blank");
            $tiles.removeClass("marked");

            this.level++;
            if (this.level > 10) {
                this.difficulty += this.level - 10;
                if (this.difficulty > 10) this.difficulty = 10;
                this.level -= 10;
            }
            setTimeout(() => {this.startNew();}, 2000);
        }
    }
}

let nonoGame = new NonoGame();