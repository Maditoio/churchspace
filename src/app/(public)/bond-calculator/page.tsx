import type { Metadata } from "next";
import { BondCalculator } from "@/components/tools/BondCalculator";

export const metadata: Metadata = {
  title: "Bond Calculator for Church Property",
  description:
    "Estimate church property bond repayments in South Africa across 5, 10, 20, 25, and 30 year terms using an adjustable interest rate.",
  alternates: {
    canonical: "/bond-calculator",
  },
};

export default function BondCalculatorPage() {
  return <BondCalculator />;
}