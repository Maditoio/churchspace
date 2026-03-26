export const paymentDisputeStatuses = ["OPEN", "UNDER_REVIEW", "WAITING_FOR_USER", "RESOLVED", "REJECTED"] as const;

export type PaymentDisputeStatusValue = (typeof paymentDisputeStatuses)[number];

export const activePaymentDisputeStatuses: PaymentDisputeStatusValue[] = ["OPEN", "UNDER_REVIEW", "WAITING_FOR_USER"];

export const paymentDisputeStatusLabels: Record<PaymentDisputeStatusValue, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  WAITING_FOR_USER: "Waiting for User",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export function isActivePaymentDisputeStatus(status: string | null | undefined) {
  return !!status && activePaymentDisputeStatuses.includes(status as PaymentDisputeStatusValue);
}