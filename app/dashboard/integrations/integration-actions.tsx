"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  actionDisableIntegration,
  actionDisconnectIntegration,
  actionEnableIntegration,
} from "@/app/actions/integrations";
import type { IntegrationKey } from "@/lib/storage/integration-store";

export function IntegrationActions({
  provider,
  connectHref,
  connected,
  enabled,
  actionsEnabled,
}: {
  provider: IntegrationKey;
  connectHref?: string;
  connected: boolean;
  enabled: boolean;
  actionsEnabled: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: "disconnect" | "enable" | "disable") {
    setMessage(null);
    startTransition(async () => {
      const result =
        action === "disconnect"
          ? await actionDisconnectIntegration(provider)
          : action === "enable"
            ? await actionEnableIntegration(provider)
            : await actionDisableIntegration(provider);

      if (!result.success) {
        setMessage(result.error ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  }

  function connect() {
    if (!connectHref) return;
    window.location.assign(connectHref);
  }

  const buttonClass = "rounded border px-3 py-2 text-xs font-semibold";
  const activeClass = `${buttonClass} border-[hsl(213_94%_62%/0.3)] bg-[hsl(213_94%_62%/0.1)] text-[hsl(213_94%_68%)]`;
  const mutedClass = `${buttonClass} border-[hsl(220_13%_18%)] text-[hsl(220_9%_32%)]`;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={connect}
          disabled={!actionsEnabled || !connectHref || isPending}
          className={actionsEnabled && connectHref ? activeClass : mutedClass}
        >
          {connected ? "Reconnect" : "Connect"}
        </button>
        <button
          type="button"
          onClick={() => run("disconnect")}
          disabled={!actionsEnabled || !connected || isPending}
          className={!actionsEnabled || !connected ? mutedClass : activeClass}
        >
          Disconnect
        </button>
        <button
          type="button"
          onClick={connect}
          disabled={!actionsEnabled || !connectHref || isPending}
          className={actionsEnabled && connectHref ? activeClass : mutedClass}
        >
          Refresh Connection
        </button>
        <button
          type="button"
          onClick={() => run(enabled ? "disable" : "enable")}
          disabled={!actionsEnabled || !connected || isPending}
          className={!actionsEnabled || !connected ? mutedClass : activeClass}
        >
          {enabled ? "Disable" : "Enable"}
        </button>
      </div>
      {message && <p className="text-xs text-[hsl(38_90%_62%)]">{message}</p>}
    </div>
  );
}
