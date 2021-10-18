import * as React from "react";
import { useEffect, useReducer, useState } from "react";
import { Instruction, InstructionTable } from "./InstructionTable";
import { Tape } from "./Tape";

import "./App.css";
interface TapeState {
  cells: Array<string>;
  headPosition: number;
}

interface TapeAction {
  name: string;
  value?: string;
  index?: number;
}

export interface AppState {
  tapeState: TapeState;
  machineState: string;
  instructions: Array<Instruction>;
}

const examples = [
  {
    initialCell: "0",
    initialState: "A",
    instructions: [
      {
        state: "A",
        tapeSymbol: "0",
        write: "1",
        move: "right",
        next: "B",
      },
      {
        state: "A",
        tapeSymbol: "1",
        write: "1",
        move: "left",
        next: "C",
      },
      {
        state: "B",
        tapeSymbol: "0",
        write: "1",
        move: "left",
        next: "A",
      },
      {
        state: "B",
        tapeSymbol: "1",
        write: "1",
        move: "right",
        next: "B",
      },
      {
        state: "C",
        tapeSymbol: "0",
        write: "1",
        move: "left",
        next: "B",
      },
      {
        state: "C",
        tapeSymbol: "1",
        write: "1",
        move: "right",
        next: "HALT",
      },
    ] as Array<Instruction>,
  },
];

const reduceState =
  (initialCell: string) => (state: TapeState, action: TapeAction) => {
    if (action.name === "left") {
      if (state.headPosition === 0) {
        state.cells.unshift(initialCell);
      } else {
        state.headPosition--;
      }
    } else if (action.name === "right") {
      state.headPosition++;
    } else if (action.name === "write") {
      state.cells[state.headPosition] = action.value;
    } else if (action.name === "setIndex") {
      if (action.index < 0) {
        const offset = state.headPosition - action.index;
        state.headPosition += offset;
        state.cells = Array(offset).fill(initialCell).concat(state.cells);
        state.cells[action.index + offset] = action.value;
      } else {
        state.cells[action.index] = action.value;
      }
    } else if (action.name === "clear") {
      state.cells = [];
      state.headPosition = 0;
    }

    return { ...state };
  };

export interface AppProps {
  initialAppState?: AppState;
  onSave: (saveState: AppState) => Promise<void>;
  onPublish: (publishState: AppState) => Promise<void>;
  readOnly: boolean;
}

export const App = ({
  initialAppState,
  onSave,
  onPublish,
  readOnly,
}: AppProps) => {
  const delay = 100;
  const maxDisplayLength = 11;
  const initialCell = examples[0].initialCell;
  const initialState = initialAppState
    ? initialAppState.machineState
    : examples[0].initialState;

  const [tape, dispatchTape] = useReducer(
    reduceState(initialCell),
    initialAppState
      ? initialAppState.tapeState
      : {
          cells: Array(maxDisplayLength).fill(initialCell),
          headPosition: 0,
        }
  );

  const [state, setState] = useState<string>(initialState);
  const [instructions, setInstructions] = useState<Array<Instruction>>(
    initialAppState ? initialAppState.instructions : examples[0].instructions
  );
  const [runInterval, setRunInterval] = useState(null);
  const [stepCounter, setStepCounter] = useState(0);

  const onInstructionChange = (index: number, instruction: Instruction) => {
    instructions[index] = instruction;
    setInstructions([...instructions]);
  };

  const removeInstruction = (index: number) => {
    instructions.splice(index, 1);
    setInstructions([...instructions]);
  };

  const addInstruction = () => {
    instructions.push({
      tapeSymbol: "",
      state: "",
      write: "",
      move: "stay",
      next: "",
    });
    setInstructions([...instructions]);
  };

  const onStateChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setState(evt.currentTarget.value);
  };

  const onTapeChange = (index: number, symbol: string) => {
    dispatchTape({
      name: "setIndex",
      index,
      value: symbol,
    });
  };

  const moveLeft = () => {
    dispatchTape({
      name: "left",
    });
  };

  const moveRight = () => {
    dispatchTape({
      name: "right",
    });
  };

  const clear = () => {
    dispatchTape({
      name: "clear",
    });
    setStepCounter(0);
  };

  const step = () => {
    setStepCounter((oldStepCounter) => oldStepCounter + 1);
  };

  useEffect(() => {
    if (stepCounter === 0) {
      return;
    }

    const currSymbol =
      tape.headPosition >= 0 && tape.headPosition < tape.cells.length
        ? tape.cells[tape.headPosition]
        : initialCell;
    const instruction = instructions.filter(
      (instruction) =>
        instruction.tapeSymbol === currSymbol && instruction.state === state
    )[0];

    if (state === "HALT") {
      if (runInterval !== null) {
        clearInterval(runInterval);
        setRunInterval(null);
      }
      return;
    }

    if (!instruction) {
      setState("HALT");
      return;
    }

    dispatchTape({
      name: "write",
      value: instruction.write,
    });

    if (instruction.move === "left" || instruction.move === "right") {
      dispatchTape({
        name: instruction.move,
      });
    }

    setState(instruction.next);
  }, [stepCounter]);

  const run = () => {
    if (runInterval === null) {
      setRunInterval(setInterval(step, delay));
    } else {
      clearInterval(runInterval);
      setRunInterval(null);
    }
  };

  const handleSave = () => {
    onSave({
      tapeState: tape,
      machineState: state,
      instructions: instructions,
    });
  };

  const handlePublish = () => {
    onPublish({
      tapeState: tape,
      machineState: state,
      instructions: instructions,
    });
  };

  return (
    <div className="AppContainer">
      <div className="toolbar">
        <button type="button" className="button" onClick={step}>
          <i className="las la-chevron-circle-right big-icon"></i> Step
        </button>
        <button type="button" className="button" onClick={run}>
          {runInterval === null ? (
            <>
              <i className="las la-play-circle big-icon"></i> Run
            </>
          ) : (
            <>
              <i className="las la-stop-circle big-icon"></i> Stop
            </>
          )}
        </button>
        <button type="button" className="button" onClick={clear}>
          <i className="las la-times-circle big-icon"></i> Clear Tape
        </button>
      </div>
      <div className="MachineContainer">
        <div className="Machine">
          <button type="button" className="button" onClick={moveLeft}>
            <i className="las la-arrow-left big-icon"></i> Left
          </button>
          <div>
            <Tape
              cells={tape.cells}
              initialCell={initialCell}
              headPosition={tape.headPosition}
              maxDisplayLength={maxDisplayLength}
              onChange={onTapeChange}
            />
            <div className="State">
              <input
                type="text"
                value={state}
                onChange={onStateChange}
                placeholder="State"
              />
            </div>
          </div>
          <button type="button" className="button" onClick={moveRight}>
            Right <i className="las la-arrow-right big-icon"></i>
          </button>
        </div>
      </div>
      <div></div>
      <div className="Instructions">
        {!readOnly && (
          <div className="actionButtons">
            <button type="button" className="button" onClick={addInstruction}>
              <i className="las la-plus-circle big-icon"></i> Add Instruction
            </button>
          </div>
        )}
        <div>
          {instructions.length > 0 && (
            <InstructionTable
              instructions={instructions}
              onChange={onInstructionChange}
              onRemove={removeInstruction}
              readOnly={readOnly}
            />
          )}
        </div>
        {!readOnly && (
          <div className="actionButtons">
            {" "}
            <button type="button" className="button" onClick={handleSave}>
              <i className="las la-cloud-upload-alt big-icon"></i> Save
            </button>
            <button type="button" className="button" onClick={handlePublish}>
              <i className="las la-share-square big-icon"></i> Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
