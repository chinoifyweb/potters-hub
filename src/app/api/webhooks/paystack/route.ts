import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/db"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex")
  return hash === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data)
        break

      case "subscription.create":
        await handleSubscriptionCreate(event.data)
        break

      case "subscription.disable":
        await handleSubscriptionDisable(event.data)
        break

      case "subscription.not_renew":
        await handleSubscriptionNotRenew(event.data)
        break

      default:
        console.log(`Unhandled Paystack event: ${event.event}`)
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    // Always return 200 to Paystack to avoid retries for processing errors
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }
}

async function handleChargeSuccess(data: any) {
  const { reference, amount, id: transactionId, metadata } = data

  if (metadata?.type === "donation") {
    // Update donation record
    await prisma.donation.updateMany({
      where: {
        paystackReference: reference,
        status: "pending",
      },
      data: {
        status: "successful",
        paystackTransactionId: String(transactionId),
      },
    })
  }

  // Handle subscription charge renewal
  if (data.plan && data.plan.plan_code) {
    const recurringDonation = await prisma.recurringDonation.findFirst({
      where: {
        paystackSubscriptionCode: data.subscription_code,
        status: "active",
      },
    })

    if (recurringDonation) {
      // Create a new donation record for the recurring payment
      await prisma.donation.create({
        data: {
          userId: recurringDonation.userId,
          categoryId: recurringDonation.categoryId,
          amount: amount / 100, // Convert from kobo
          paystackReference: reference,
          paystackTransactionId: String(transactionId),
          status: "successful",
        },
      })
    }
  }
}

async function handleSubscriptionCreate(data: any) {
  const { subscription_code, email_token, next_payment_date, customer } = data

  // Find user by email and update recurring donation
  const user = await prisma.user.findUnique({
    where: { email: customer.email },
  })

  if (user) {
    await prisma.recurringDonation.updateMany({
      where: {
        userId: user.id,
        paystackSubscriptionCode: subscription_code,
      },
      data: {
        status: "active",
        nextPaymentDate: next_payment_date
          ? new Date(next_payment_date)
          : null,
      },
    })
  }
}

async function handleSubscriptionDisable(data: any) {
  const { subscription_code } = data

  await prisma.recurringDonation.updateMany({
    where: { paystackSubscriptionCode: subscription_code },
    data: { status: "cancelled" },
  })
}

async function handleSubscriptionNotRenew(data: any) {
  const { subscription_code } = data

  await prisma.recurringDonation.updateMany({
    where: { paystackSubscriptionCode: subscription_code },
    data: { status: "cancelled" },
  })
}
