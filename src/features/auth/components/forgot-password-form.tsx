"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Refresh } from "iconsax-reactjs";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import {
  useResetForgotPasswordMutation,
  useStartForgotPasswordMutation,
  useVerifyForgotPasswordMutation,
} from "../api/use-forgot-password-mutation";
import {
  forgotPasswordResetSchema,
  forgotPasswordSchema,
  forgotPasswordVerificationSchema,
  type ForgotPasswordChallenge,
  type ForgotPasswordResetValues,
  type ForgotPasswordValues,
  type ForgotPasswordVerificationValues,
} from "../schemas/forgot-password.schema";
import { AuthStepper } from "./auth-stepper";
import { ForgotPasswordResetForm } from "./forgot-password-reset-form";
import { inputClassName } from "./signup-fields";
import { SignupVerificationForm } from "./signup-verification-form";

type ForgotPasswordFlowState =
  { step: 1 } | { step: 2; challenge: ForgotPasswordChallenge } | { step: 3; challengeId: string; completed: boolean };

export function ForgotPasswordForm() {
  const tErrors = useTranslations("ApiErrors");

  function getForgotPasswordErrorMessage(error: unknown): string | null {
    if (!error) return null;
    if (error instanceof Error && error.name !== "AxiosError") return error.message;
    return getApiErrorMessage(error, tErrors);
  }

  const t = useTranslations("Auth");
  const [flow, setFlow] = useState<ForgotPasswordFlowState>({ step: 1 });
  const startMutation = useStartForgotPasswordMutation();
  const verifyMutation = useVerifyForgotPasswordMutation();
  const resetMutation = useResetForgotPasswordMutation();
  const emailForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const verificationForm = useForm<ForgotPasswordVerificationValues>({
    resolver: zodResolver(forgotPasswordVerificationSchema),
    defaultValues: { code: "" },
  });
  const passwordForm = useForm<ForgotPasswordResetValues>({
    resolver: zodResolver(forgotPasswordResetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  function submitEmail(values: ForgotPasswordValues) {
    startMutation.mutate(values, {
      onSuccess: (challenge) => {
        verifyMutation.reset();
        resetMutation.reset();
        verificationForm.reset({ code: "" });
        passwordForm.reset({ newPassword: "", confirmPassword: "" });
        setFlow({ step: 2, challenge });
      },
    });
  }

  function submitVerification(values: ForgotPasswordVerificationValues) {
    if (flow.step !== 2) return;
    verifyMutation.mutate(
      { challengeId: flow.challenge.challengeId, code: values.code },
      { onSuccess: () => setFlow({ step: 3, challengeId: flow.challenge.challengeId, completed: false }) },
    );
  }

  function submitPassword(values: ForgotPasswordResetValues) {
    if (flow.step !== 3) return;
    resetMutation.mutate(
      { challengeId: flow.challengeId, ...values },
      {
        onSuccess: () => {
          passwordForm.reset({ newPassword: "", confirmPassword: "" });
          resetMutation.reset();
          setFlow((current) => (current.step === 3 ? { ...current, completed: true } : current));
        },
      },
    );
  }

  async function resendVerification(): Promise<void> {
    const challenge = await startMutation.mutateAsync(emailForm.getValues());
    setFlow({ step: 2, challenge });
  }

  const stepper = (activeStep: 1 | 2 | 3) => (
    <AuthStepper
      activeStep={activeStep}
      steps={[
        [t("stepOne"), t("emailAddress")],
        [t("stepTwo"), t("verification")],
        [t("stepThree"), t("newPassword")],
      ]}
      ariaLabel={t("passwordResetProgress")}
    />
  );

  if (flow.step === 1) {
    return (
      <>
        {stepper(1)}
        <div className="w-full pt-8 sm:pt-10">
          <h2 className="text-[32px] font-semibold leading-[43px] text-[var(--auth-ink)]">
            {t("forgotPasswordTitle")}
          </h2>
          <p className="mt-2 text-base leading-6 text-[var(--auth-muted)]">{t("forgotPasswordPrompt")}</p>
        </div>
        <Form {...emailForm}>
          <form className="space-y-4 pt-6" noValidate onSubmit={emailForm.handleSubmit(submitEmail)}>
            {getForgotPasswordErrorMessage(startMutation.error) ? (
              <Alert>{getForgotPasswordErrorMessage(startMutation.error)}</Alert>
            ) : null}
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder={t("enterEmailAddress")}
                      className={inputClassName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="brand" size="auth" type="submit" disabled={startMutation.isPending}>
              {startMutation.isPending ? (
                <Refresh className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="order-2 size-3.5" aria-hidden="true" />
              )}
              {startMutation.isPending ? t("sending") : t("sendVerificationCode")}
            </Button>
          </form>
        </Form>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#164990] hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("backToLogin")}
        </Link>
      </>
    );
  }

  if (flow.step === 2) {
    return (
      <>
        {stepper(2)}
        <SignupVerificationForm
          key={`${flow.challenge.challengeId}:${flow.challenge.expiresAt}`}
          form={verificationForm}
          verifyMutation={verifyMutation}
          onSubmit={submitVerification}
          onBack={() => {
            startMutation.reset();
            verifyMutation.reset();
            setFlow({ step: 1 });
          }}
          onResend={resendVerification}
          resendPending={startMutation.isPending}
          resendError={getForgotPasswordErrorMessage(startMutation.error)}
          expiresAt={flow.challenge.expiresAt}
          errorMessage={getForgotPasswordErrorMessage}
          description={t("resetCodeDescription")}
          backLabel={t("backToEmail")}
        />
      </>
    );
  }

  return (
    <>
      {stepper(3)}
      <ForgotPasswordResetForm
        form={passwordForm}
        resetMutation={resetMutation}
        completed={flow.completed}
        onSubmit={submitPassword}
        errorMessage={getForgotPasswordErrorMessage}
      />
    </>
  );
}
