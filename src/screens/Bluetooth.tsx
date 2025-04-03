import { useEffect, useState } from "react";
import BtDevice from "../components/bluetooth/Device";
import { NavTab, TabContent } from "../components/generic/NavTabs";
import { BluetoothDevice, NotificationPayload } from "../Constants";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useNotification } from "../components/notifications/Notification";

const Bluetooth = () => {
  const [connectedDevAddress, setConnectedDevAddress] = useState("");
  const [searching, setSearching] = useState<boolean>(false);
  const [searchingDisabled, setSearchingDisabled] = useState<boolean>(false);
  const [foundDevices, setFoundDevices] = useState<BluetoothDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    const promiseFoundDevice = listen<BluetoothDevice>('bt-device-found', (e) => onFoundDevice(e.payload));
    const promiseDiscovering = listen<string>('bt-discovering', (e) => onDiscovering(e.payload));
    const promiseDeviceConnected = listen<NotificationPayload>('bt-device-connected', (e) => onDeviceConnected(e.payload));
    const promiseDeviceDisconnected = listen<NotificationPayload>('bt-device-disconnected', (e) => onDeviceDisconnected(e.payload));

    invoke('get_discovery_status');
    invoke('get_known_devices');

    return () => {
      promiseFoundDevice.then(unlisten => { console.log("Unlistening found device"); unlisten(); });
      promiseDiscovering.then(unlisten => { console.log("Unlistening discovering"); unlisten(); });
      promiseDeviceConnected.then(unlisten => { console.log("Unlistening device connected"); unlisten(); });
      promiseDeviceDisconnected.then(unlisten => { console.log("Unlistening device disconnected"); unlisten(); });
    }
  }, []);

  const startSearch = () => {
    invoke('start_discovery')
      .then(() => setSearchingDisabled(false))
      .catch(() => invoke('get_discovery_status'));
  }
  const stopSearch = () => {
    invoke('stop_discovery')
      .then(() => setSearchingDisabled(false))
      .catch(() => invoke('get_discovery_status'));
  }

  const onFoundDevice = (payload: BluetoothDevice) => {
    console.log("Setting found: ", payload);
    payload.connected && setConnectedDevAddress(payload.address);
    payload.paired
      ? setPairedDevices(prev => {
        const itemExists = prev.some(item => item.address === payload.address);
        return itemExists ? prev : [...prev, payload];
      })
      : setFoundDevices(prev => {
        const itemExists = prev.some(item => item.address === payload.address);
        return itemExists ? prev : [...prev, payload];
      })
  }

  const onDiscovering = (payload: string) => {
    console.log("Bluetooth discovering: ", payload);
    setSearching(payload.includes("true"));
  }

  const onDeviceDisconnected = (payload: NotificationPayload) => {
    console.log("Device disconnected: ", payload)
    showNotification(payload);
    payload.context && setConnectedDevAddress("");
  }

  const onDeviceConnected = (payload: NotificationPayload) => {
    console.log("Device connected: ", payload)
    showNotification(payload);
    payload.context && setConnectedDevAddress(payload.context);
  }

  return (
    <div className="container">
      <div className="row mt-2">
        <div className="nav nav-tabs nav-justified" role="tablist">
          <NavTab id="btNavPaired" target="#btNavcPaired" text="Paired" active />
          <NavTab id="btNavSearch" target="#btNavcSearch" text="Search" />
        </div>

        <div className="tab-content border border-top-0 rounded-bottom" id="btTabsContent">
          <TabContent id="btNavcPaired" labelledBy="btNavPaired" active>
            <div className="m-3 overflow-scroll custom-overflow-h">
              {pairedDevices.map(dev => {
                return (<BtDevice key={dev.address} device={dev} connected={dev.address.trim() === connectedDevAddress.trim()} />)
              })}
            </div>
          </TabContent>
          <TabContent id="btNavcSearch" labelledBy="btNavSearch">
            <div className="m-3">
              <div className="overflow-scroll custom-overflow-h">
                <div className="mb-3">
                  {searching ? (
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span>Searching...</span>
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      <button className="btn btn-danger ps-4 pe-4 ms-auto" onClick={stopSearch} disabled={searchingDisabled}>Stop</button>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span>Start search</span>
                      <button className="btn btn-primary ps-4 pe-4 ms-auto" onClick={startSearch} disabled={searchingDisabled}>Start</button>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  {foundDevices.map(dev => (<BtDevice key={dev.address} device={dev} />))}
                </div>
              </div>
            </div>
          </TabContent>
        </div>
      </div >
    </div >
  );
}

export default Bluetooth;
