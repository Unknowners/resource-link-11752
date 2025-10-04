import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 25 users",
        "2 integrations",
        "Basic group management",
        "Email support",
        "Audit logs (30 days)",
      ],
    },
    {
      name: "Professional",
      price: "$149",
      description: "For growing teams with advanced needs",
      features: [
        "Up to 100 users",
        "All integrations included",
        "Advanced group management",
        "Priority support",
        "Audit logs (90 days)",
        "Custom roles",
        "SSO (coming soon)",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Unlimited users",
        "All integrations included",
        "Advanced security features",
        "Dedicated support",
        "Unlimited audit logs",
        "Custom roles & permissions",
        "SSO & SAML",
        "SLA guarantee",
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-20 sm:py-32" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6">
              <span className="gradient-text">Simple, Transparent</span>
              <br />
              Pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your organization. All plans include core features.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/signup">
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2">Can I change plans later?</h3>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Yes, all plans come with a 14-day free trial. No credit card required to start.
                </p>
              </div>
              <div>
                <h3 className="mb-2">What integrations are included?</h3>
                <p className="text-muted-foreground">
                  Professional and Enterprise plans include all integrations (Jira, Confluence, Notion, Google Drive). Starter includes 2 integrations of your choice.
                </p>
              </div>
              <div>
                <h3 className="mb-2">How does billing work?</h3>
                <p className="text-muted-foreground">
                  Billing is monthly or annual (save 20% with annual billing). You can cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
