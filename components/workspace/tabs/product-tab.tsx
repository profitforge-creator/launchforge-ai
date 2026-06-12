import type { ProductConcept } from "@/types";

function ImproveButton({
  onClick,
  regenerating,
}: {
  onClick: () => void;
  regenerating: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={regenerating}
      className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium transition-colors"
      style={{
        border: "1px solid hsl(213 94% 62% / 0.25)",
        color: "hsl(213 94% 65%)",
        backgroundColor: "hsl(213 94% 62% / 0.04)",
        opacity: regenerating ? 0.4 : 1,
        cursor: regenerating ? "not-allowed" : "pointer",
      }}
    >
      {regenerating ? (
        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24" style={{ color: "currentColor" }}>
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      )}
      {regenerating ? "Regenerating…" : "Improve Product"}
    </button>
  );
}

export function ProductTab({
  product,
  onRegenerate,
  regenerating = false,
}: {
  product: ProductConcept;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "hsl(220 9% 36%)" }}>Product</p>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(220 9% 93%)", letterSpacing: "-0.02em" }}>
            {product.name}
          </h2>
          <p className="text-sm mt-1" style={{ color: "hsl(220 9% 50%)" }}>{product.tagline}</p>
        </div>
        {onRegenerate && (
          <div className="shrink-0 pt-1">
            <ImproveButton onClick={onRegenerate} regenerating={regenerating} />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Main card */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-xl p-5 space-y-5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 38%)" }}>Description</p>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 68%)" }}>{product.description}</p>
            </div>
            <div className="h-px" style={{ backgroundColor: "hsl(220 13% 14%)" }} />
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "hsl(220 9% 38%)" }}>Target audience</p>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 68%)" }}>{product.targetAudience}</p>
            </div>
          </div>

          {/* Deliverables */}
          <div className="rounded-xl p-5" style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}>
            <p className="text-xs font-medium mb-3" style={{ color: "hsl(220 9% 38%)" }}>Deliverables — what the customer receives</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {product.deliverables.map((d, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
                  style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 16%)" }}
                >
                  <span
                    className="shrink-0 text-xs font-bold tabular-nums w-4 h-4 rounded flex items-center justify-center mt-px"
                    style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", color: "hsl(213 94% 65%)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 64%)" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {[
            { label: "Pricing model",   value: product.pricingModel },
            { label: "Suggested price", value: product.suggestedPrice },
            { label: "Time to launch",  value: product.timeToLaunch },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl px-4 py-4"
              style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
            >
              <p className="text-xs mb-1.5" style={{ color: "hsl(220 9% 38%)" }}>{m.label}</p>
              <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 85%)" }}>{m.value}</p>
            </div>
          ))}

          {/* Value proposition */}
          <div
            className="rounded-xl px-4 py-4"
            style={{ border: "1px solid hsl(151 60% 48% / 0.15)", backgroundColor: "hsl(151 60% 48% / 0.04)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "hsl(151 60% 48%)" }}>Value proposition</p>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 48%)" }}>
              {product.tagline}. For {product.targetAudience?.split(" ").slice(0, 6).join(" ")}…
            </p>
          </div>

          {/* Refine via AI */}
          <div
            className="rounded-xl px-4 py-4"
            style={{ border: "1px dashed hsl(213 94% 62% / 0.2)", backgroundColor: "hsl(213 94% 62% / 0.03)" }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: "hsl(213 94% 62%)" }}>Refine with AI</p>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 44%)" }}>
              Click "Ask AI" to adjust pricing, retarget the audience, or add a premium tier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
