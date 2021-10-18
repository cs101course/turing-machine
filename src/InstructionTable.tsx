import * as React from "react";

export interface Instruction {
  tapeSymbol: string;
  state: string;
  write: string;
  move: "left" | "right" | "stay";
  next: string;
}

interface InstructionTableProps {
  instructions: Array<Instruction>;
  onChange: (index: number, instruction: Instruction) => void;
  onRemove: (index: number) => void;
  readOnly: boolean;
};

export const InstructionTable = ({ instructions, onChange, onRemove, readOnly }: InstructionTableProps) => {
  const onWriteChange = (index: number) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    const instruction = {
      ...instructions[index],
      write: evt.currentTarget.value
    };

    onChange(index, instruction);
  };

  const onStateChange = (index: number) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    const instruction = {
      ...instructions[index],
      state: evt.currentTarget.value
    };

    onChange(index, instruction);
  };
  
  const onMoveChange = (index: number) => (evt: React.ChangeEvent<HTMLSelectElement>) => {
    let move: "left" | "right" | "stay" = "stay";
    
    if (evt.currentTarget.value === "left" || evt.currentTarget.value === "right") {
      move = evt.currentTarget.value;
    }

    const instruction = {
      ...instructions[index],
      move
    };

    onChange(index, instruction);
  };

  const onSymbolChange = (index: number) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    const instruction = {
      ...instructions[index],
      tapeSymbol: evt.currentTarget.value
    };

    onChange(index, instruction);
  };

  const onNextStateChange = (index: number) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    const instruction = {
      ...instructions[index],
      next: evt.currentTarget.value
    };

    onChange(index, instruction);
  };

  const remove = (index: number) => () => {
    onRemove(index);
  };

  return <div className="InstructionTable">
    <table>
      <thead>
        <tr className="TopHeader">
          <th colSpan={2}>Look Up</th>
          <th className="Separator" colSpan={3}>Perform</th>
        </tr>
        <tr className="TopHeader">
          <th>State</th>
          <th>Tape Symbol</th>
          <th className="Separator">Write</th>
          <th>Move</th>
          <th>Next State</th>
          { !readOnly && <th></th> }
        </tr>
      </thead>
      <tbody>
        { instructions.map((instruction, index) => (
          <tr key={index}>
            <td>
              <input type="text" onChange={onStateChange(index)} value={instruction.state} placeholder="State" readOnly={readOnly}/>
            </td>
            <td>
              <input type="text" onChange={onSymbolChange(index)} value={instruction.tapeSymbol} placeholder="Symbol" readOnly={readOnly}/>
            </td>
            <td className="Separator">
              <input type="text" onChange={onWriteChange(index)} value={instruction.write} placeholder="Symbol" readOnly={readOnly}/>
            </td>
            <td>
              <select onChange={onMoveChange(index)} value={instruction.move} disabled={readOnly}>
                <option value="left">Move Left</option>
                <option value="right">Move Right</option>
                <option value="stay">Don't Move</option>
              </select>
            </td>
            <td>
              <input type="text" onChange={onNextStateChange(index)} value={instruction.next} placeholder="State" readOnly={readOnly}/>
            </td>
            { !readOnly && <td>
              <button type="button" className="button" onClick={remove(index)}><i className="las la-minus-circle big-icon"></i> Delete</button>
            </td> }
          </tr>
        ))}
      </tbody>
    </table>
  </div>
};
