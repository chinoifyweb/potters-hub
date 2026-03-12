"use client";

import { useState } from "react";
import {
  Heart,
  ChevronDown,
  HelpCircle,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const quickAmounts = [1000, 5000, 10000, 50000];
const categories = [
  "Tithes",
  "Offerings",
  "Building Fund",
  "Missions",
  "Youth Ministry",
  "Welfare",
  "Other",
];
const intervals = ["Weekly", "Monthly", "Quarterly"];

const faqs = [
  {
    q: "Is my donation secure?",
    a: "Yes, all transactions are processed through Paystack, a PCI-DSS compliant payment processor. Your financial information is encrypted and secure.",
  },
  {
    q: "Can I get a receipt for my donation?",
    a: "Absolutely! A receipt is automatically sent to your email after each successful donation. You can also view your giving history in your account dashboard.",
  },
  {
    q: "How do I cancel a recurring donation?",
    a: "You can manage your recurring donations from your account dashboard, or contact the church office and we will assist you.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept debit cards, credit cards, bank transfers, and USSD payments through Paystack.",
  },
];

export default function GivePage() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Tithes");
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState("Monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleQuickAmount = (val: number) => {
    setAmount(val.toLocaleString());
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold">Give Generously</h1>
          <p className="text-amber-100 mt-3 max-w-xl mx-auto italic">
            &ldquo;Each of you should give what you have decided in your heart to
            give, not reluctantly or under compulsion, for God loves a cheerful
            giver.&rdquo; &mdash; 2 Corinthians 9:7
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Donation Form */}
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold">Make a Donation</h2>

                {/* Quick Amounts */}
                <div>
                  <Label className="mb-2 block">Select Amount</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {quickAmounts.map((val) => (
                      <Button
                        key={val}
                        variant={
                          amount === val.toLocaleString()
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleQuickAmount(val)}
                        className="h-11"
                      >
                        &#8358;{val.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      &#8358;
                    </span>
                    <Input
                      placeholder="Enter custom amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="mb-2 block">Giving Category</Label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="mb-2 block">
                      Full Name
                    </Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Recurring Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Repeat className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Recurring Donation</p>
                      <p className="text-xs text-muted-foreground">
                        Give automatically on a schedule
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isRecurring ? "bg-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isRecurring ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {isRecurring && (
                  <div>
                    <Label className="mb-2 block">Frequency</Label>
                    <div className="flex gap-2">
                      {intervals.map((int) => (
                        <Button
                          key={int}
                          size="sm"
                          variant={interval === int ? "default" : "outline"}
                          onClick={() => setInterval(int)}
                        >
                          {int}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Give{" "}
                  {amount
                    ? `\u20A6${amount}`
                    : "Now"}
                </Button>
              </CardContent>
            </Card>

            {/* Why We Give + FAQ */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Why We Give</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Giving is an act of worship and obedience. When we give, we
                    acknowledge that everything we have comes from God and we
                    trust Him to provide for our needs.
                  </p>
                  <p>
                    Your generous contributions support our church&apos;s mission
                    to spread the Gospel, care for those in need, develop the
                    next generation of leaders, and build facilities that serve
                    our community.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {[
                      { label: "Community Outreach", pct: "30%" },
                      { label: "Church Operations", pct: "25%" },
                      { label: "Missions & Evangelism", pct: "25%" },
                      { label: "Youth & Children", pct: "20%" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 border rounded-lg text-center"
                      >
                        <p className="text-2xl font-bold text-primary">
                          {item.pct}
                        </p>
                        <p className="text-xs mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-muted-foreground" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border rounded-lg">
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === i ? null : i)
                        }
                        className="w-full flex items-center justify-between p-4 text-left font-medium text-sm"
                      >
                        {faq.q}
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                            openFaq === i ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openFaq === i && (
                        <div className="px-4 pb-4 text-sm text-muted-foreground">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
