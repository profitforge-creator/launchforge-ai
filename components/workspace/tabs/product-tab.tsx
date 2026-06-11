import type { ProductConcept } from "@/types";

export function ProductTab({ product }: { product: ProductConcept }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Main content */}
      <div
        className="md:col-span-2 rounded-xl p-6 space-y-5"
        style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: "hsl(220 9% 40%)" }}>Product name</p>
          <p className="text-2xl font-bold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>{product.name}</p>
          <p className="text-sm mt-1" style={{ color: "hsl(220 9% 50%)" }}>{product.tagline}</p>
        </div>

        <div className="h-px" style={{ backgroundColor: "hsl(220 13% 15%)" }} />

        <div>
          <p className="text-xs mb-2" style={{ color: "hsl(220 9% 40%)" }}>Description</p>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 68%)" }}>{product.description}</p>
        </div>

        <div>
          <p className="text-xs mb-2" style={{ color: "hsl(220 9% 40%)" }}>Target audience</p>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(220 9% 68%)" }}>{product.targetAudience}</p>
        </div>

        <div>
          <p className="text-xs mb-2.5" style={{ color: "hsl(220 9% 40%)" }}>Deliverables</p>
          <ul className="space-y-1.5">
            {product.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(213 94% 62%)" }}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm" style={{ color: "hsl(220 9% 65%)" }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sidebar metrics */}
      <div className="space-y-3">
        {[
          { label: "Pricing model",   value: product.pricingModel },
          { label: "Suggested price", value: product.suggestedPrice },
          { label: "Time to launch",  value: product.timeToLaunch },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-4"
            style={{ border: "1px solid hsl(220 13% 16%)", backgroundColor: "hsl(220 13% 10%)" }}
          >
            <p className="text-xs mb-1.5" style={{ color: "hsl(220 9% 40%)" }}>{m.label}</p>
            <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 85%)" }}>{m.value}</p>
          </div>
        ))}

        {/* Refine prompt */}
        <div
          className="rounded-xl p-4"
          style={{ border: "1px dashed hsl(213 94% 62% / 0.2)", backgroundColor: "hsl(213 94% 62% / 0.04)" }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: "hsl(213 94% 62%)" }}>Refine this product</p>
          <p className="text-xs leading-relaxed" style={{ color: "hsl(220 9% 45%)" }}>
            Use the conversation panel below to adjust pricing, add a premium tier, or retarget to a different audience.
          </p>
        </div>
      </div>
    </div>
  );
}
