import { useEffect, useState } from "react";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const update = () => setTime(new Date());

    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000;

    const timeout = setTimeout(() => {
      update();
      setInterval(update, 60 * 1000);
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <span>{time.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}</span>
  );
}

export default Clock;
