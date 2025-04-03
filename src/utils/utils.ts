export const parsePathname = (path: string) => {
  switch (path) {
    case "/":
      return "Home";
    case "/music":
      return "Music";
    case "/bluetooth":
      return "Bluetooth";
    case "/navigation":
      return "Navigation";
    case "/radio":
      return "Radio";
    case "/internet_radio":
      return "Internet Radio";
    case "/boards":
      return "Boards";

    case "/settings":
      return "Settings";
    case "/settings/wifi":
      return "Settings > Wifi";
    case "/settings/updates":
      return "Settings > Updates";
  }
  const boardMatch = path.match(/^\/board\/(\d+)$/);
  if (boardMatch) return `Boards > Board ${boardMatch[1]}`;

  return path;
};

export const secToMusicTime = (secs: number | undefined) => {
  if (!secs) return "00:00:00";
  return new Date(secs * 1000).toISOString().slice(11, 19);
};
