import { useState, useEffect } from "react";
import { Check, ArrowRight, Crown, Star, Award, Zap } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Replace with your Stripe publishable key
const stripePromise = loadStripe("pk_test_your_publishable_key");

// Logo component that matches our existing branding
const Logo = () => (
  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
    DIMENSION
  </div>
);

// Navbar component
const Navbar = () => (
  <nav className="px-6 py-4 flex justify-between items-center">
    <div className="flex items-center">
      <Logo />
    </div>
    <div className="flex items-center space-x-4">
      <a
        href="/login"
        className="text-purple-300 hover:text-white transition-colors"
      >
        Login
      </a>
      <a
        href="/signup"
        className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
      >
        Sign Up
      </a>
    </div>
  </nav>
);

// Footer component
const Footer = ({ marginTop }) => (
  <footer className="py-8 px-6 bg-black" style={{ marginTop }}>
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <Logo />
        <p className="text-gray-500">
          © 2025 Dimension Streaming. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

// Enhanced PlanCard component
const PlanCard = ({ title, price, features, isPopular, onSelect, icon }) => {
  const IconComponent = icon;

  return (
    <div
      className={`bg-gradient-to-b ${
        isPopular ? "from-purple-900 to-blue-900" : "from-gray-900 to-black"
      } rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 ${
        isPopular
          ? "shadow-lg shadow-purple-500/20 border-2 border-purple-500"
          : "border border-gray-800"
      }`}
    >
      {isPopular && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-2 px-4 text-center">
          <span className="font-bold text-sm uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div
            className={`p-2 rounded-full ${
              isPopular ? "bg-purple-600" : "bg-gray-800"
            }`}
          >
            <IconComponent size={20} />
          </div>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-400">/month</span>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check size={18} className="text-green-400 mr-2 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onSelect}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center font-bold ${
            isPopular
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              : "bg-gray-800 hover:bg-gray-700"
          } transition-colors`}
        >
          Select Plan <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// Actual Stripe checkout form component
const CheckoutForm = ({ selectedPlan, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    async function createPaymentIntent() {
      try {
        // In a real application, make a server call to create a PaymentIntent
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: selectedPlan.title,
            price: selectedPlan.price.replace("$", ""),
          }),
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError("Failed to initialize payment. Please try again.");
      }
    }

    createPaymentIntent();
  }, [selectedPlan]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setLoading(true);
    setError(null);

    // Get a reference to a CardElement instance
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: formData.name,
        email: formData.email,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Confirm the payment with the client secret
    const { error: confirmError } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: paymentMethod.id,
      }
    );

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
      return;
    }

    // The payment succeeded!
    alert(`Subscription to ${selectedPlan.title} plan successful!`);
    window.location.href = "/home";
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#fff",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
        backgroundColor: "#1f2937",
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-purple-400 hover:text-purple-300 flex items-center"
        >
          <ArrowRight size={16} className="mr-2 transform rotate-180" /> Back to
          plans
        </button>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl mb-6">
        <h3 className="text-xl font-bold mb-2">Order Summary</h3>
        <div className="flex justify-between py-3 border-b border-gray-800">
          <span>{selectedPlan.title} Plan</span>
          <span className="font-bold">{selectedPlan.price}/month</span>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-800">
          <span>Taxes</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="flex justify-between py-3 text-lg font-bold">
          <span>Total</span>
          <span>{selectedPlan.price}/month</span>
        </div>
      </div>

      <div className="bg-black p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Payment Details</h3>
        <p className="text-yellow-400 text-sm mb-4 bg-yellow-900 bg-opacity-30 p-2 rounded">
          <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242, any
          future expiration date, and any CVC.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1 text-gray-300"
              >
                Cardholder Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-gray-300"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="card"
                className="block text-sm font-medium mb-1 text-gray-300"
              >
                Card Details
              </label>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus-within:border-purple-500 transition-colors">
                <CardElement options={cardElementOptions} />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={!stripe || loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold flex items-center justify-center transition-colors disabled:opacity-70"
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-center">
          <img
            src="/api/placeholder/200/40"
            alt="Payment secured by Stripe"
            className="h-6"
          />
        </div>
      </div>
    </div>
  );
};

// Wrapper component for Stripe Elements
const StripeCheckoutForm = ({ selectedPlan, onBack }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm selectedPlan={selectedPlan} onBack={onBack} />
    </Elements>
  );
};

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Enhanced plans with more details and icons
  const plans = [
    {
      title: "Basic",
      price: billingCycle === "monthly" ? "$8.99" : "$89.99",
      features: [
        "720p Resolution",
        "Good Video and sound quality",
        "Watch on any device",
        "Cancel anytime",
        "Standard 3D content",
      ],
      icon: Zap,
    },
    {
      title: "Standard",
      price: billingCycle === "monthly" ? "$13.99" : "$139.99",
      features: [
        "1080p Full HD",
        "Great Video and sound quality",
        "Watch on 2 devices",
        "Cancel anytime",
        "Advanced 3D content",
        "Ad-free experience",
      ],
      isPopular: true,
      icon: Star,
    },
    {
      title: "Premium",
      price: billingCycle === "monthly" ? "$17.99" : "$179.99",
      features: [
        "4K + HDR",
        "Best Video and sound quality",
        "Watch on 4 devices",
        "Download & watch offline",
        "Premium 3D and VR content",
        "Early access to new releases",
        "Exclusive content",
      ],
      icon: Crown,
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleBack = () => {
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white">
      <Navbar />

      <main className="py-12 px-4">
        {!selectedPlan ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Choose Your Dimension
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Unlock the full potential of 3D streaming with our flexible
                plans. Enjoy unlimited movies, TV shows, and immersive
                experiences on any device.
              </p>

              <div className="mt-8 inline-flex items-center p-1 bg-gray-800 rounded-lg">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-md ${
                    billingCycle === "monthly"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    billingCycle === "yearly"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  Yearly{" "}
                  <span className="ml-2 text-xs bg-green-500 text-black px-2 py-1 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <PlanCard
                  key={index}
                  title={plan.title}
                  price={plan.price}
                  features={plan.features}
                  isPopular={plan.isPopular}
                  onSelect={() => handleSelectPlan(plan)}
                  icon={plan.icon}
                />
              ))}
            </div>

            <div className="mt-12 bg-gray-900 p-6 rounded-xl max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Award size={20} className="mr-2 text-purple-400" /> All Plans
                Include
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                  <span>7-day free trial</span>
                </div>
                <div className="flex items-start">
                  <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                  <span>No contract, cancel anytime</span>
                </div>
                <div className="flex items-start">
                  <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                  <span>Cross-platform compatibility</span>
                </div>
                <div className="flex items-start">
                  <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                  <span>Personalized recommendations</span>
                </div>
                <div className="flex items-start">
                  <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                  <span>24/7 customer support</span>
                </div>
                <div className="flex items-start">
                  <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <StripeCheckoutForm selectedPlan={selectedPlan} onBack={handleBack} />
        )}
      </main>

      <Footer marginTop={selectedPlan ? "60px" : "80px"} />
    </div>
  );
}
