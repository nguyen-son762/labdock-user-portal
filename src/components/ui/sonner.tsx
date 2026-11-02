"use client";

import { CloseCircle, TickCircle } from "iconsax-reactjs";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-right"
      richColors
      closeButton
      duration={4000}
      style={{ fontFamily: "inherit" }}
      icons={{
        success: <TickCircle size={20} variant="Bold" aria-hidden="true" />,
        error: <CloseCircle size={20} variant="Bold" aria-hidden="true" />,
      }}
      {...props}
    />
  );
}
