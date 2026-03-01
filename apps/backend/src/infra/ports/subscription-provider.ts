/**
 * Port for payment/subscription provider operations (Stripe, Apple, etc.).
 * Domain depends on this abstraction; infrastructure implements it.
 */
export interface SubscriptionProvider {
  scheduleCancelAtPeriodEnd(providerSubscriptionId: string): Promise<Date>
  cancelImmediately(providerSubscriptionId: string): Promise<void>
}
