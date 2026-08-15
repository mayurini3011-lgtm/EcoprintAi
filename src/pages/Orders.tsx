import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaletteSwatches, StatusPill } from "@/components/garment/PaletteSwatches";
import { GarmentPreview } from "@/components/garment/GarmentPreview";
import { QrCode } from "@/components/security/QrCode";
import { ORDER_STEPS, ORDER_STEP_LABELS } from "@/convex/constants";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, ChevronDown, Loader2, QrCode as QrIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { formatDate, formatINR } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const orders = useQuery(api.catalog.myOrders);
  const advance = useMutation(api.orders.advanceOrderStatus);
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  if (!orders) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          My Orders
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Your garments, end to end
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track production status and open each garment's secure traceability
          record.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const currentIdx = ORDER_STEPS.indexOf(
            order.status as (typeof ORDER_STEPS)[number],
          );
          const isOpen = openOrder === order.orderCode;
          return (
            <Card key={order.orderCode} className="shadow-none border-border/70">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GarmentPreview
                      palette={order.palette}
                      garmentType="Kurta"
                      motif={order.plantName}
                      className="w-16 shrink-0 rounded-lg border"
                    />
                    <div>
                      <p className="text-sm font-semibold">{order.designTitle}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {order.orderCode} · placed {formatDate(order.createdAt)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {order.garmentId ?? "Garment ID pending"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={ORDER_STEP_LABELS[order.status] ?? order.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Toggle details"
                      onClick={() =>
                        setOpenOrder(isOpen ? null : order.orderCode)
                      }
                    >
                      <ChevronDown
                        className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                      />
                    </Button>
                  </div>
                </div>

                {/* Status stepper */}
                <div className="mt-4 flex items-center gap-0">
                  {ORDER_STEPS.map((step, i) => (
                    <div key={step} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border text-[9px] font-semibold",
                            i < currentIdx
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : i === currentIdx
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {i < currentIdx ? "✓" : i + 1}
                        </span>
                        <span
                          className={cn(
                            "hidden w-14 text-center text-[9px] leading-tight sm:block",
                            i === currentIdx
                              ? "font-medium text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {ORDER_STEP_LABELS[step]}
                        </span>
                      </div>
                      {i < ORDER_STEPS.length - 1 && (
                        <span
                          className={cn(
                            "mx-1 h-px flex-1",
                            i < currentIdx ? "bg-emerald-400" : "bg-border",
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {isOpen && (
                  <div className="mt-5 space-y-4 border-t border-border/60 pt-4">
                    <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                      <Info label="Fabric" value={`${order.fabricName}`} />
                      <Info label="Natural dye" value={order.dyeName} />
                      <Info label="Tailor" value={order.tailorName} />
                      <Info label="Total" value={formatINR(order.totalPrice)} />
                      <Info
                        label="Measurements"
                        value={`${order.measurements.heightCm} cm · ${order.measurements.lengthPreference}`}
                      />
                      <Info
                        label="Delivery slot"
                        value={
                          order.deliveryDate
                            ? `${new Date(order.deliveryDate).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short" },
                              )} · ${order.deliveryWindow ?? "—"}`
                            : "Not booked"
                        }
                      />
                      <Info
                        label="Payment"
                        value={
                          order.paymentMethod
                            ? order.paymentMethod === "cod"
                              ? "Cash on delivery"
                              : order.paymentMethod.toUpperCase()
                            : "—"
                        }
                      />
                      <Info
                        label="Palette"
                        value={undefined}
                        custom={
                          <PaletteSwatches palette={order.palette} size="sm" />
                        }
                      />
                    </div>

                    {order.notes && (
                      <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs">
                        <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                          Note for the tailor
                        </p>
                        <p className="mt-0.5 text-muted-foreground">
                          “{order.notes}”
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      {order.garmentId ? (
                        <>
                          <Button asChild size="sm">
                            <Link to={`/verify/${order.garmentId}`}>
                              <QrIcon className="mr-2 size-4" />
                              Verify garment
                            </Link>
                          </Button>
                          <QrCode
                            value={`${window.location.origin}/verify/${order.garmentId}`}
                            size={84}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentIdx >= ORDER_STEPS.length - 1}
                            onClick={async () => {
                              await advance({ orderId: order._id });
                            }}
                          >
                            Advance status <ArrowRight className="ml-2 size-3.5" />
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Garment identity is minted once production starts.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {orders.length === 0 && (
        <Card className="shadow-none border-border/70">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Loader2 className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading demo orders…</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  custom,
}: {
  label: string;
  value?: string;
  custom?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {custom ?? <p className="mt-0.5 font-medium">{value}</p>}
    </div>
  );
}
