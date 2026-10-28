"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Refresh } from "iconsax-reactjs";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

import { useLoginMutation } from "../api/use-login-mutation";
import { loginSchema, type LoginValues } from "../schemas/login.schema";

export function LoginForm() {
  const tErrors = useTranslations("ApiErrors");
  const t = useTranslations("Auth");
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function handleLogin(values: LoginValues): void {
    loginMutation.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-4" noValidate onSubmit={form.handleSubmit(handleLogin)}>
        {loginMutation.isError ? <Alert>{getApiErrorMessage(loginMutation.error, tErrors)}</Alert> : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("emailAddress")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={t("enterEmailAddress")}
                  className="h-[42px] rounded-lg border-[var(--auth-input-border)] px-3.5 py-2.5 text-base shadow-[0_1px_2px_rgba(10,13,18,0.05)]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("password")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-[42px] rounded-lg border-[var(--auth-input-border)] px-3.5 py-2.5 text-base shadow-[0_1px_2px_rgba(10,13,18,0.05)]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#164990] underline-offset-4 hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button variant="brand" size="auth" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <Refresh className="size-4 animate-spin" aria-hidden="true" /> : null}
          {loginMutation.isPending ? t("loggingIn") : t("logIn")}
          {!loginMutation.isPending ? <ArrowRight className="size-3.5" aria-hidden="true" /> : null}
        </Button>
      </form>
      <p className="mt-5 flex gap-1 text-sm text-[#868da5]">
        {t("noAccount")}
        <Link href="/signup" className="font-medium text-[#164990] underline-offset-4 hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </Form>
  );
}
