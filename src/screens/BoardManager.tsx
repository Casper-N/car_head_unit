import { useEffect, useState } from "react";
import { MicroController } from "../Constants";
import Board from "../components/boards/Board";

const TEST_DEVICES: MicroController[] = [
  { id: 1, name: 'Test 1', fqbn: 'Testfqbn:1', port: '/dev/sda1', isArduino: true },
  { id: 2, name: 'Test 2', fqbn: 'Testfqbn:2', port: '/dev/sda2', isArduino: true },
  { id: 3, name: 'Test 3', fqbn: 'Testfqbn:3', port: '/dev/sda3', isArduino: true },
  { id: 3, name: 'Test 3', fqbn: 'Testfqbn:3', port: '/dev/sda3', isArduino: true },
  { id: 3, name: 'Test 3', fqbn: 'Testfqbn:3', port: '/dev/sda3', isArduino: true },
  { id: 3, name: 'Test 3', fqbn: 'Testfqbn:3', port: '/dev/sda3', isArduino: true },
  { id: 3, name: 'Test 3', fqbn: 'Testfqbn:3', port: '/dev/sda3', isArduino: true },
  { id: 3, name: 'Test 3', fqbn: 'Testfqbn:3', port: '/dev/sda3', isArduino: true },
  { id: 3, name: 'Test 3', fqbn: 'Testfqbn:3', port: '/dev/sda3', isArduino: true },
]

const BoardManager = () => {
  const [devices, setDevices] = useState<MicroController[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setDevices(TEST_DEVICES);
  }, [])

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-8">
          <span className="fs-3 fw-bold">Board manager</span>
          {isScanning && (
            <div className="ms-3 spinner-border spinner-border-sm" role="status"></div>
          )}
        </div>
        <button className={`btn col-4 ${isScanning ? "btn-danger" : "btn-primary"}`} onClick={() => setIsScanning(!isScanning)}>
          {isScanning ? "Stop Scan" : "Start Scan"}
        </button>
      </div>

      <ul className="list-group mt-3 overflow-scroll custom-overflow-h">
        {devices.length > 0 ? (
          devices.map((board) => (
            <Board board={board} />
          ))
        ) : (
          <li className="list-group-item text-muted">No devices found</li>
        )}
      </ul>
    </div>
  );
}

export default BoardManager;
