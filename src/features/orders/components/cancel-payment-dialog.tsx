"use client";

import { ArrowRight, Warning2 } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/class-names";

import { useCancelPaymentMutation } from "../api/use-order-payment-mutations";
import { cancelPaymentReasons, type CancelPaymentReason } from "../schemas/order.schema";
import { getOrderPaymentErrorCode } from "../utils/order-payment-error";

const COMMENT_MAX_LENGTH = 500;

type CancelPaymentDialogProps = {
  orderId: string;
  orderNumber: string;
  /** The button that opens the confirmation. */
  children: ReactNode;
  onCancelled?: () => void;
};

/** Asks the buyer for a reason before cancelling an unpaid order; the cancelled order is not returned to the cart. */
export function CancelPaymentDialog({ orderId, orderNumber, children, onCancelled }: CancelPaymentDialogProps) {
  const t = useTranslations("Orders");
  const tErrors = useTranslations("ApiErrors");
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<CancelPaymentReason | null>(null);
  const [comment, setComment] = useState("");
  const [showReasonError, setShowReasonError] = useState(false);
  const cancelPayment = useCancelPaymentMutation();
  const reasonLabelId = useId();
  const reasonErrorId = useId();
  const commentId = useId();

  function handleOpenChange(open: boolean) {
    if (cancelPayment.isPending) return;
    setIsOpen(open);
    if (!open) {
      setReason(null);
      setComment("");
      setShowReasonError(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cancelPayment.isPending) return;
    if (!reason) {
      setShowReasonError(true);
      return;
    }

    const trimmedComment = comment.trim();
    cancelPayment.mutate(
      { orderId, reason, ...(trimmedComment ? { comment: trimmedComment } : {}) },
      {
        onSuccess: () => {
          handleOpenChange(false);
          toast.success(t("cancelPaymentSuccess", { orderNumber }));
          onCancelled?.();
        },
        onError: (error) => {
          setIsOpen(false);
          const code = getOrderPaymentErrorCode(error);
          if (code === "payment_not_cancellable") toast.error(t("paymentNotCancellable"));
          else if (code === "order_status_changed") toast.error(t("orderStatusChanged"));
          else toast.error(t("cancelPaymentError"), { description: getApiErrorMessage(error, tErrors) });
        },
      },
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent hideClose className="max-h-[calc(100dvh-2rem)] max-w-[480px] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <DialogHeader className="space-y-4">
            <span className="flex size-12 items-center justify-center rounded-full border-[6px] border-[#fffaeb] bg-[#fef0c7] text-[#dc6803]">
              <Warning2 size={22} aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <DialogTitle className="text-lg leading-6 text-[#051a50]">
                {t("cancelPaymentTitle", { orderNumber })}
              </DialogTitle>
              <DialogDescription>{t("cancelPaymentDescription")}</DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <p id={reasonLabelId} className="text-sm font-medium text-[#051a50]">
              {t("cancelReasonLabel")}
              <span className="ml-0.5 text-[#d92d20]" aria-hidden="true">
                *
              </span>
            </p>
            <RadioGroup
              value={reason ?? ""}
              onValueChange={(value) => {
                setReason(value as CancelPaymentReason);
                setShowReasonError(false);
              }}
              aria-labelledby={reasonLabelId}
              aria-required="true"
              aria-invalid={showReasonError}
              aria-describedby={showReasonError ? reasonErrorId : undefined}
              disabled={cancelPayment.isPending}
            >
              {cancelPaymentReasons.map((value) => (
                <label
                  key={value}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[#dde2e8] bg-white px-4 py-2.5 text-sm text-[#051a50] transition-colors hover:border-[#a3abbd]",
                    reason === value && "border-[#2f7bc4] bg-[#f0f6fd] hover:border-[#2f7bc4]",
                    showReasonError && "border-[#fda29b]",
                  )}
                >
                  <RadioGroupItem value={value} />
                  <span>{t(`cancelReasons.${value}`)}</span>
                </label>
              ))}
            </RadioGroup>
            {showReasonError ? (
              <p id={reasonErrorId} role="alert" className="text-sm text-[#d92d20]">
                {t("cancelReasonRequired")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={commentId} className="text-sm font-medium text-[#051a50]">
              {t("cancelCommentLabel")}
            </label>
            <Textarea
              id={commentId}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={t("cancelCommentPlaceholder")}
              maxLength={COMMENT_MAX_LENGTH}
              disabled={cancelPayment.isPending}
              className="min-h-[88px] resize-none rounded-lg border-[#dde2e8] px-4 py-2.5 text-[#051a50] shadow-none placeholder:text-[#a3abbd] focus-visible:border-[#2f7bc4]"
            />
          </div>

          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-full border-[#c8d0d9] font-normal text-[#73798f] shadow-none"
                disabled={cancelPayment.isPending}
              >
                {t("keepOrder")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="brand"
              className="h-11 flex-1 justify-between gap-4 pl-5 pr-1.5 shadow-none"
              aria-busy={cancelPayment.isPending}
              disabled={cancelPayment.isPending}
            >
              <span className="flex-1 text-center">{t("cancelPayment")}</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
