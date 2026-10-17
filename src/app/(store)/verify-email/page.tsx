import { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Email - Hill Brew Tea",
  description: "Verify your email address to activate your Hill Brew Tea account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}
