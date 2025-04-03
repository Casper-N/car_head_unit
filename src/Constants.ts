export type Color = string;

export const COLORS = {
  black: "#3C3C3C",
  white: "#EAEAFA",
  error: "#FFAAAA",
};

export type CustomDropdownOption = {
  label: string;
  value: number;
};

export enum NotificationLevel {
  Normal = "alert-primary",
  Success = "alert-success",
  Warning = "alert-warning",
  Danger = "alert-danger",
}

export type SongInfoType = {
  title: string;
  artist: string;
  album: string;
  album_url: string;
  length: number;
};

export type MusicStatus = {
  is_playing: boolean;
  song_info: SongInfoType;
};

export enum WifiState {
  Connected = "connected",
  Searching = "searching",
  On = "on",
  Off = "off",
}

export enum BtState {
  Connected = "connected",
  Searching = "searching",
  On = "on",
  Off = "off",
}

export type BluetoothDevice = {
  name: string;
  address: string;
  paired: boolean;
  connected: boolean;
  icon: string;
};

export type MicroController = {
  id: number;
  name: string;
  fqbn: string;
  port: string;
  isArduino: boolean;
};

export type BoardOutput = {
  timestamp: string;
  output: string;
};

export const BaudRates: CustomDropdownOption[] = [
  { label: "9600", value: 9600 },
  { label: "19200", value: 19200 },
  { label: "28800", value: 28800 },
  { label: "38400", value: 38400 },
  { label: "57600", value: 57600 },
  { label: "76800", value: 76800 },
  { label: "115200", value: 115200 },
];

export type NotificationPayload = {
  title: string;
  text: string;
  level: NotificationLevel;
  context?: string;
};
