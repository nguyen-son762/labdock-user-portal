"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Refresh2, TickCircle } from "iconsax-reactjs";
import { useForm } from "react-hook-form";
import { useFormatter, useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import { useChangePasswordMutation } from "../api/use-change-password-mutation";
import { passwordFormSchema, type PasswordFormValues } from "../schemas/profile-form.schema";

const passwordDefaults: PasswordFormValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function ProfileSecurityCard({
  editing,
  onEdit,
  onCancel,
  passwordChangedAt,
}: {
  passwordChangedAt: string | null;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const tErrors = useTranslations("ApiErrors");
  const t = useTranslations("Profile");
  const format = useFormatter();
  const mutation = useChangePasswordMutation();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: passwordDefaults,
  });

  function handleCancel() {
    form.reset(passwordDefaults);
    mutation.reset();
    onCancel();
  }

  function handleSubmit(values: PasswordFormValues) {
    mutation.mutate(values, { onSuccess: () => form.reset(passwordDefaults) });
  }

  return (
    <Card className="h-fit overflow-hidden border-[#dde2e8] !shadow-none">
      <div className="flex h-[50px] items-center justify-between border-b border-[#dde2e8] px-4">
        <h2 className="text-xl font-medium text-[#1f5fa8]">{t("security")}</h2>
        {!editing ? (
          <Button type="button" variant="ghost" className="h-8 px-2 font-normal text-[#164990]" onClick={onEdit}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <g clip-path="url(#clip0_13323_4308)">
                <path
                  d="M9.1665 3.3332H3.33317C2.89114 3.3332 2.46722 3.50879 2.15466 3.82135C1.8421 4.13391 1.6665 4.55784 1.6665 4.99986V16.6665C1.6665 17.1086 1.8421 17.5325 2.15466 17.845C2.46722 18.1576 2.89114 18.3332 3.33317 18.3332H14.9998C15.4419 18.3332 15.8658 18.1576 16.1783 17.845C16.4909 17.5325 16.6665 17.1086 16.6665 16.6665V10.8332M15.4165 2.0832C15.748 1.75168 16.1977 1.56543 16.6665 1.56543C17.1353 1.56543 17.585 1.75168 17.9165 2.0832C18.248 2.41472 18.4343 2.86436 18.4343 3.3332C18.4343 3.80204 18.248 4.25168 17.9165 4.5832L9.99984 12.4999L6.6665 13.3332L7.49984 9.99986L15.4165 2.0832Z"
                  stroke="#164990"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_13323_4308">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            {t("changePassword")}
          </Button>
        ) : null}
      </div>
      {editing ? (
        <Form {...form}>
          <form className="space-y-4 p-4" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
            {mutation.isError ? <Alert>{getApiErrorMessage(mutation.error, tErrors)}</Alert> : null}
            {mutation.isSuccess ? (
              <p
                role="status"
                className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
              >
                <TickCircle className="size-4" aria-hidden="true" /> {t("passwordUpdated")}
              </p>
            ) : null}
            {(["currentPassword", "newPassword", "confirmPassword"] as const).map((name) => {
              const labels = {
                currentPassword: t("currentPassword"),
                newPassword: t("newPassword"),
                confirmPassword: t("confirmPassword"),
              };
              const placeholders = {
                currentPassword: t("enterCurrentPassword"),
                newPassword: t("enterNewPassword"),
                confirmPassword: t("enterPasswordAgain"),
              };
              return (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs text-[#051a50]">
                        {labels[name]} <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
                          placeholder={placeholders[name]}
                          className="h-10 border-[#dde2e8] bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              );
            })}
            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-[#c8d0d9] font-normal"
                onClick={handleCancel}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" variant="brand" size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? <Refresh2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                {mutation.isPending ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-4 pt-6 text-sm text-[#051a50]">
          <span className="text-[13px] text-[#73798f]">{t("password")}</span>
          <span>••••••••</span>
          <span className="col-span-2">
            {t("lastChanged", {
              time: passwordChangedAt
                ? format.dateTime(new Date(passwordChangedAt), {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                : t("unknown"),
            })}
          </span>
        </div>
      )}
    </Card>
  );
}
