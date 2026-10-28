"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { getApiErrorMessage } from "@/lib/api-error";

import { useCompleteSignupMutation, useSignupMutation, useVerifySignupMutation } from "../api/use-signup-mutation";
import {
  passwordSchema,
  signupSchema,
  verificationSchema,
  type PasswordValues,
  type SignupChallenge,
  type SignupValues,
  type VerificationValues,
} from "../schemas/signup.schema";
import { AuthStepper } from "./auth-stepper";
import { SignupAccountForm } from "./signup-account-form";
import { SignupPasswordForm } from "./signup-password-form";
import { SignupVerificationForm } from "./signup-verification-form";

type SignupFlowState = { step: 1 } | { step: 2; challenge: SignupChallenge } | { step: 3; challengeId: string };

export function SignupForm() {
  const tErrors = useTranslations("ApiErrors");

  function getSignupErrorMessage(error: unknown): string | null {
    if (!error) return null;
    if (error instanceof Error && error.name !== "AxiosError") return error.message;
    return getApiErrorMessage(error, tErrors);
  }

  const [flow, setFlow] = useState<SignupFlowState>({ step: 1 });
  const signupMutation = useSignupMutation();
  const verifyMutation = useVerifySignupMutation();
  const completeMutation = useCompleteSignupMutation();
  const accountForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      company: "",
      fullName: "",
      email: "",
      phoneCode: "+65",
      phone: "",
      country: "",
      region: "",
      address: "",
    },
  });
  const verificationForm = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function submitAccount(values: SignupValues) {
    signupMutation.mutate(values, {
      onSuccess: (challenge) => {
        verifyMutation.reset();
        completeMutation.reset();
        verificationForm.reset({ code: "" });
        passwordForm.reset({ password: "", confirmPassword: "" });
        setFlow({ step: 2, challenge });
      },
    });
  }

  function submitVerification(values: VerificationValues) {
    if (flow.step !== 2) return;
    verifyMutation.mutate(
      { challengeId: flow.challenge.challengeId, code: values.code },
      { onSuccess: () => setFlow({ step: 3, challengeId: flow.challenge.challengeId }) },
    );
  }

  function submitPassword(values: PasswordValues) {
    if (flow.step !== 3) return;
    completeMutation.mutate({ challengeId: flow.challengeId, ...values });
  }

  async function resendVerification(): Promise<void> {
    const challenge = await signupMutation.mutateAsync(accountForm.getValues());
    setFlow({ step: 2, challenge });
  }

  if (flow.step === 1) {
    return (
      <>
        <AuthStepper activeStep={1} />
        <SignupAccountForm
          form={accountForm}
          signupMutation={signupMutation}
          onSubmit={submitAccount}
          errorMessage={getSignupErrorMessage}
        />
      </>
    );
  }

  if (flow.step === 2) {
    return (
      <>
        <AuthStepper activeStep={2} />
        <SignupVerificationForm
          key={`${flow.challenge.challengeId}:${flow.challenge.expiresAt}`}
          form={verificationForm}
          verifyMutation={verifyMutation}
          onSubmit={submitVerification}
          onBack={() => setFlow({ step: 1 })}
          onResend={resendVerification}
          resendPending={signupMutation.isPending}
          resendError={getSignupErrorMessage(signupMutation.error)}
          expiresAt={flow.challenge.expiresAt}
          errorMessage={getSignupErrorMessage}
        />
      </>
    );
  }

  return (
    <>
      <AuthStepper activeStep={3} />
      <SignupPasswordForm
        form={passwordForm}
        completeMutation={completeMutation}
        onSubmit={submitPassword}
        errorMessage={getSignupErrorMessage}
      />
    </>
  );
}
