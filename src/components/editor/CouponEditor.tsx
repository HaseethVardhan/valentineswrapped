import { Plus, X, Ticket } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Card, CardContent } from "../ui/card"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import type { CouponPage, Coupon } from "../../types"

interface CouponEditorProps {
    page: CouponPage
    onUpdate: (updates: Partial<CouponPage>) => void
}

export function CouponEditor({ page, onUpdate }: CouponEditorProps) {
    const handleAddCoupon = () => {
        const newCoupon: Coupon = {
            id: `coupon-${Date.now()}`,
            title: "",
            description: "",
            isRedeemable: true,
        }

        onUpdate({
            content: {
                ...page.content,
                coupons: [...page.content.coupons, newCoupon],
            },
        })
    }

    const handleUpdateCoupon = (couponId: string, updates: Partial<Coupon>) => {
        onUpdate({
            content: {
                ...page.content,
                coupons: page.content.coupons.map((c) =>
                    c.id === couponId ? { ...c, ...updates } : c
                ),
            },
        })
    }

    const handleRemoveCoupon = (couponId: string) => {
        onUpdate({
            content: {
                ...page.content,
                coupons: page.content.coupons.filter((c) => c.id !== couponId),
            },
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Love Coupons</h3>
                <Button onClick={handleAddCoupon} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Coupon
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {page.content.coupons.map((coupon, index) => (
                    <Card key={coupon.id} className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveCoupon(coupon.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <CardContent className="pt-8 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <Ticket className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">Coupon {index + 1}</span>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor={`title-${coupon.id}`} className="sr-only">Title</Label>
                                <Input
                                    id={`title-${coupon.id}`}
                                    placeholder="Title (e.g. Movie Night)"
                                    value={coupon.title}
                                    onChange={(e) => handleUpdateCoupon(coupon.id, { title: e.target.value })}
                                    className="font-semibold"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor={`desc-${coupon.id}`} className="sr-only">Description</Label>
                                <Textarea
                                    id={`desc-${coupon.id}`}
                                    placeholder="Details (e.g. Valid for one movie of your choice...)"
                                    value={coupon.description}
                                    onChange={(e) => handleUpdateCoupon(coupon.id, { description: e.target.value })}
                                    className="resize-none h-20 text-sm"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Label htmlFor={`redeem-${coupon.id}`} className="text-xs">Redeemable?</Label>
                                <Switch
                                    id={`redeem-${coupon.id}`}
                                    checked={coupon.isRedeemable}
                                    onCheckedChange={(checked) => handleUpdateCoupon(coupon.id, { isRedeemable: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {page.content.coupons.length === 0 && (
                    <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 text-slate-500 dark:bg-slate-900/50">
                        <p className="mb-2 text-sm">No coupons yet</p>
                        <Button variant="outline" size="sm" onClick={handleAddCoupon}>create one</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
