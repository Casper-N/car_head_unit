import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BaudRates, BoardOutput } from "../../Constants";

const BoardDetails = () => {
  const location = useLocation();

  const board = location.state?.board;

  if (!board) {
    return <h2 className="mt-4">Board not found (or state not passed)</h2>;
  }

  const [boardOutput, setBoardOutput] = useState<BoardOutput[]>([]);
  const [_baudRate, setBaudRate] = useState<number>(9600);

  useEffect(() => {
    setBoardOutput([{ timestamp: "21:00:00", output: "Test" }, { timestamp: "", output: "Test" }, { timestamp: "", output: "Test", }]);
  }, [])

  return (
    <div className="container">
      <div className="row mb-3 mt-2">
        <h2 className="col-7">Monitoring {board.name}</h2>
        <div className="col-5 d-flex flex-row align-items-center">
          <label htmlFor="baudRateDropdown" className="me-2 text-nowrap fs-4"><span>Baud rate:</span></label>
          <select id="baudRateDropdown" className="form-select form-select-lg" onChange={(opt) => setBaudRate(parseInt(opt.target.value, 10))}>
            {BaudRates.map(rate => (
              <option value={rate.value}>{rate.label}</option>
            ))}
          </select>
        </div>
      </div>
      <pre className="bg-black px-2">
        {boardOutput.map(out => (<div className="col-12">
          {out.timestamp.length > 0 && <span>[{out.timestamp}] </span>}
          <span>{out.output}</span>
        </div>))}
      </pre>
    </div>
  );
}

export default BoardDetails;
