/**
 * Port for payment/subscription provider operations (Stripe, Apple, etc.).
 * Domain depends on this abstraction; infrastructure implements it.
 */
export interface SubscriptionProvider {
  getCurrentPeriodEnd(providerSubscriptionId: string): Promise<Date>
  scheduleCancelAtPeriodEnd(
    providerSubscriptionId: string,
    periodEnd: Date
  ): Promise<void>
  cancelImmediately(providerSubscriptionId: string): Promise<void>
}
