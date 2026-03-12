import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = "https://api.paystack.co"

interface PaystackResponse<T = any> {
  status: boolean
  message: string
  data: T
}

interface TransactionData {
  authorization_url: string
  access_code: string
  reference: string
}

interface VerifyTransactionData {
  id: number
  status: string
  reference: string
  amount: number
  currency: string
  channel: string
  customer: {
    id: number
    email: string
    first_name: string | null
    last_name: string | null
  }
  metadata: Record<string, any>
  paid_at: string
}

interface PlanData {
  id: number
  name: string
  plan_code: string
  amount: number
  interval: string
  currency: string
}

interface SubscriptionData {
  id: number
  subscription_code: string
  email_token: string
  status: string
  next_payment_date: string
}

async function paystackFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `Paystack API error: ${response.status}`)
  }

  return data
}

export class PaystackService {
  /**
   * Initialize a one-time transaction
   */
  static async initializeTransaction(
    email: string,
    amount: number, // in kobo
    reference: string,
    metadata: Record<string, any> = {},
    callbackUrl?: string
  ): Promise<PaystackResponse<TransactionData>> {
    return paystackFetch<TransactionData>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email,
        amount,
        reference,
        metadata,
        callback_url: callbackUrl,
      }),
    })
  }

  /**
   * Verify a transaction by reference
   */
  static async verifyTransaction(
    reference: string
  ): Promise<PaystackResponse<VerifyTransactionData>> {
    return paystackFetch<VerifyTransactionData>(
      `/transaction/verify/${encodeURIComponent(reference)}`
    )
  }

  /**
   * Create a subscription plan
   */
  static async createPlan(
    name: string,
    amount: number, // in kobo
    interval: "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually"
  ): Promise<PaystackResponse<PlanData>> {
    return paystackFetch<PlanData>("/plan", {
      method: "POST",
      body: JSON.stringify({
        name,
        amount,
        interval,
      }),
    })
  }

  /**
   * Get a plan by plan code
   */
  static async getPlan(planCode: string): Promise<PaystackResponse<PlanData>> {
    return paystackFetch<PlanData>(`/plan/${encodeURIComponent(planCode)}`)
  }

  /**
   * Create a subscription for a customer
   */
  static async createSubscription(
    customer: string, // customer email or code
    plan: string, // plan code
    authorization?: string // authorization code from previous transaction
  ): Promise<PaystackResponse<SubscriptionData>> {
    return paystackFetch<SubscriptionData>("/subscription", {
      method: "POST",
      body: JSON.stringify({
        customer,
        plan,
        ...(authorization && { authorization }),
      }),
    })
  }

  /**
   * Disable (cancel) a subscription
   */
  static async disableSubscription(
    subscriptionCode: string,
    emailToken: string
  ): Promise<PaystackResponse<{ status: string }>> {
    return paystackFetch("/subscription/disable", {
      method: "POST",
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken,
      }),
    })
  }

  /**
   * Get a subscription by code
   */
  static async getSubscription(
    subscriptionCode: string
  ): Promise<PaystackResponse<SubscriptionData>> {
    return paystackFetch<SubscriptionData>(
      `/subscription/${encodeURIComponent(subscriptionCode)}`
    )
  }

  /**
   * Fetch a single customer by email or code
   */
  static async getCustomer(
    emailOrCode: string
  ): Promise<PaystackResponse<any>> {
    return paystackFetch(`/customer/${encodeURIComponent(emailOrCode)}`)
  }

  /**
   * List all transactions (with optional pagination)
   */
  static async listTransactions(params?: {
    perPage?: number
    page?: number
    status?: string
    from?: string
    to?: string
  }): Promise<PaystackResponse<any[]>> {
    const query = new URLSearchParams()
    if (params?.perPage) query.set("perPage", params.perPage.toString())
    if (params?.page) query.set("page", params.page.toString())
    if (params?.status) query.set("status", params.status)
    if (params?.from) query.set("from", params.from)
    if (params?.to) query.set("to", params.to)

    const qs = query.toString()
    return paystackFetch(`/transaction${qs ? `?${qs}` : ""}`)
  }

  /**
   * Verify Paystack webhook signature
   */
  static verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex")

    return hash === signature
  }

  /**
   * Initialize a transaction with a subscription plan (first payment)
   */
  static async initializeSubscriptionPayment(
    email: string,
    amount: number,
    planCode: string,
    reference: string,
    metadata: Record<string, any> = {},
    callbackUrl?: string
  ): Promise<PaystackResponse<TransactionData>> {
    return paystackFetch<TransactionData>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email,
        amount,
        plan: planCode,
        reference,
        metadata,
        callback_url: callbackUrl,
      }),
    })
  }

  /**
   * Create a transfer recipient (for payouts)
   */
  static async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string
  ): Promise<PaystackResponse<any>> {
    return paystackFetch("/transferrecipient", {
      method: "POST",
      body: JSON.stringify({
        type: "nuban",
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    })
  }

  /**
   * Initiate a transfer (payout)
   */
  static async initiateTransfer(
    amount: number, // in kobo
    recipientCode: string,
    reason?: string,
    reference?: string
  ): Promise<PaystackResponse<any>> {
    return paystackFetch("/transfer", {
      method: "POST",
      body: JSON.stringify({
        source: "balance",
        amount,
        recipient: recipientCode,
        reason,
        reference,
      }),
    })
  }

  /**
   * List banks (for bank account selection)
   */
  static async listBanks(
    country = "nigeria"
  ): Promise<PaystackResponse<Array<{ name: string; code: string }>>> {
    return paystackFetch(`/bank?country=${country}`)
  }

  /**
   * Resolve bank account (verify account number + bank)
   */
  static async resolveAccountNumber(
    accountNumber: string,
    bankCode: string
  ): Promise<PaystackResponse<{ account_number: string; account_name: string }>> {
    return paystackFetch(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    )
  }
}

export default PaystackService
