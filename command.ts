// Commands are an object-oriented replacement for callbacks.
// - The Gang of Four
// - https://en.wikipedia.org/wiki/Command_pattern

enum Action {
    BUY_ACTION = "BUY",
    SELL_ACTION = "SELL",
}

interface Buyer { buy: () => void; }
interface Seller { sell: () => void; }

class Actor implements Buyer, Seller {
    buy() { console.log("buy"); }
    sell() { console.log("sell"); }
}

interface SimpleCommand {
    execute: (actor: Actor) => void;
}

interface UndoableCommand extends SimpleCommand {
    undo: () => void;
}

class BuyCommand implements SimpleCommand {
    execute(actor: Actor) {
        actor.buy();
    }
}

class SellCommand implements SimpleCommand {
    execute(actor: Actor) {
        actor.sell();
    }
}

class ModifyUnitCommand implements UndoableCommand {
    constructor(private unit: Unit, private value: number, private prevValue: number) { }

    execute() {
        this.prevValue = this.unit.value;
        this.unit.moveTo(this.value);
    }

    undo() {
        this.unit.moveTo(this.prevValue);
    }
}

class InputHandler {
    private buyCommand: BuyCommand;
    private sellCommand: SellCommand;
    private selectedUnit: Unit;

    constructor() {
        this.buyCommand = new BuyCommand();
        this.sellCommand = new SellCommand();
    }

    handleInput() {
        if (isTriggered(Action.BUY_ACTION)) {
            return this.buyCommand;
        }
        if (isTriggered(Action.SELL_ACTION)) {
            return this.sellCommand;
        }

        return null;
    }

    handleUnitInput() {
        this.selectedUnit = getSelectedUnit();
        if (isTriggered(Action.BUY_ACTION)) {
            let newValue = this.selectedUnit.value + 1;
            // represent a thing that can be done at a specific point in time
            return new ModifyUnitCommand(this.selectedUnit, newValue, this.selectedUnit.value);
        }
        if (isTriggered(Action.SELL_ACTION)) {
            let newValue = this.selectedUnit.value - 1;
            return new ModifyUnitCommand(this.selectedUnit, newValue, this.selectedUnit.value);
        }

        return null;
    }
}

class Unit {
    private _value: number;

    moveTo(value: number) {
        this._value += value;
    }

    public get value() {
        return this._value;
    }

    public set value(value: number) {
        this._value = value;
    }
}

function getSelectedUnit(): Unit {
    return new Unit();
}

function isTriggered(action: Action): boolean {
    return true;
}

function demo() {
    const inputHandler = new InputHandler();
    const command = inputHandler.handleInput();
    if (command) {
        command.execute(new Actor());
    }
}

demo();
