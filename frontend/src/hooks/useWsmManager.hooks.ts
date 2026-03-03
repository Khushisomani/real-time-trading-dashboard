import { useEffect, useMemo, useState } from "react";
import { WsManager, WsStatus } from "../ws/wsManager"

export function useWsManager<TMsg>(url: string, debug = false) {
  const [status, setStatus] = useState<WsStatus>("idle");

  const mgr = useMemo(() => {
    return new WsManager<TMsg>({
      url,
      debug
    });
  }, [url, debug]);

  useEffect(() => {
    const off = mgr.onStatus(setStatus);
    mgr.connect();

    return () => {
      off();
      mgr.destroy();
    };
  }, [mgr]);

  return { mgr, status };
}