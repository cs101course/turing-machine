import * as React from "react";

interface TapeProps {
  cells: Array<string>;
  initialCell: string;
  headPosition: number;
  maxDisplayLength: number;
  onChange: (index: number, value: string) => void;
};

export const Tape = ({ cells, initialCell, headPosition, maxDisplayLength, onChange }: TapeProps) => {
  const displayedTape = Array(maxDisplayLength).fill(0).map((_, index) => {
    const cellIndex = index + headPosition - Math.floor(maxDisplayLength / 2);

    let cellValue = {
      symbol: initialCell,
      index: cellIndex
    };

    if (cellIndex >= 0) {
      cellValue.symbol = cells[cellIndex];
    }
    return cellValue;
  });

  const onCellChange = (index: number) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, evt.currentTarget.value);
  };

  const onCellBlur = (index: number) => (evt: React.FocusEvent<HTMLInputElement>) => {
    if (evt.currentTarget.value === "") {
      onChange(index, initialCell);
    }
  };

  return <div className="TapeContainer">
    <div className="Tape">
      {displayedTape.map((cell, index) =>
        <div className="TapeCell" key={index}>
          <input type="text" value={cell.symbol === undefined ? initialCell : cell.symbol} onChange={onCellChange(cell.index)} onBlur={onCellBlur(cell.index)}/>
        </div>
      )}
    </div>
    <div className="TapeHead">
    </div>
  </div>
};
