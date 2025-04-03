import { useState } from "react";
import { BluetoothDevice } from "../../Constants";
import Icon from "../../utils/svgUtils";
import { invoke } from "@tauri-apps/api/core";

interface BtDeviceProps {
  device: BluetoothDevice;
  connected?: boolean;
  pairing?: boolean;
  connecting?: boolean;
}

const BtDevice: React.FC<BtDeviceProps> = ({ device, connected, pairing, connecting }) => {
  const [show, setShow] = useState<boolean>(false);

  let classNames = "bg-primary mb-3 border border-2 rounded";
  if (connected) classNames += " border-success";
  else if (connecting || pairing) classNames += "border-warning";

  const getStatus = () => {
    if (connected) return "";
    if (pairing) return "Pairing...";
    if (connecting) return "Connecting...";
    return "";
  }

  const connect = () => {
    invoke('connect_to_device', { address: device.address });
  }

  const disconnect = () => {
    invoke('disconnect_from_device', { address: device.address });
  }

  return (
    <div key={device.address} className={classNames}>
      <div role="button" className="card bg-primary border-0 hover-opacity" onClick={() => setShow(!show)}>
        <div className="row g-0">
          <div className="col-1 align-self-center text-center">
            <Icon name={device.icon} size={45} />
          </div>
          <div className="col-9">
            <div className="card-body">
              <h5 className="card-title"><span>{device.name}</span></h5>
              <p className="card-text"><small className="text-muted"><span>{device.address}</span></small></p>
            </div>
          </div>
          <div className="col-2 text-center align-self-center">{getStatus()}</div>
        </div>
      </div>
      <div className={`collapse ${show ? 'show' : ''}`} id={`collapse-${device.address}`}>
        <div className="container p-3">
          <div className="d-flex gap-2 align-items-center justify-content-between">
            {connected ? (
              <button className="w-50 btn btn-lg btn-danger" onClick={() => disconnect()}><span>Disconnect</span></button>
            ) : (
              <button className="w-50 btn btn-lg btn-success" onClick={() => connect()}><span>Connect</span></button>
            )}
            <button className="w-50 btn btn-secondary btn-lg"><span>Remove</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BtDevice;
