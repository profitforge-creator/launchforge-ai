import { GeneratedAssetsSection } from "@/components/features/generated-assets-section";
import type { AssetSet } from "@/lib/assets/types";

export function AssetsTab({ assets }: { assets: AssetSet | undefined }) {
  if (!assets) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ border: "1px dashed hsl(220 13% 18%)", backgroundColor: "hsl(220 13% 10%)" }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "hsl(220 9% 55%)" }}>No assets generated</p>
        <p className="text-xs" style={{ color: "hsl(220 9% 38%)" }}>
          This workspace was generated before asset creation was available.
          Generate a new business to receive downloadable assets.
        </p>
      </div>
    );
  }

  return <GeneratedAssetsSection assetSet={assets} />;
}
