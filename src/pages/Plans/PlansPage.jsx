import { useState, useEffect, useCallback } from "react";
import {
  Check,
  ArrowRight,
  Crown,
  Star,
  Award,
  Zap,
  Wallet,
  Coffee,
} from "lucide-react";
import { ethers } from "ethers";
import SubscriptionPaymentABI from "../../abis/SubscriptionPayment.json";
import { auth, db } from "../firebase/firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import EthereumCheckoutForm from "./EthereumCheckoutForm";
import Logo from "../../components/Logo/Logo";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  (import.meta.env.MODE === "development"
    ? "0xYourTestContractAddress"
    : undefined);
const PlanCard = ({
  title,
  price,
  features,
  isPopular,
  onSelect,
  icon,
  isFree,
}) => {
  const IconComponent = icon;

  return (
    <div
      className={`bg-gradient-to-b ${
        isPopular
          ? "from-purple-900 to-blue-900"
          : isFree
          ? "from-green-900 to-blue-900"
          : "from-gray-900 to-black"
      } rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 ${
        isPopular
          ? "shadow-lg shadow-purple-500/20 border-2 border-purple-500"
          : isFree
          ? "shadow-lg shadow-green-500/20 border-2 border-green-500"
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
      {isFree && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 py-2 px-4 text-center">
          <span className="font-bold text-sm uppercase tracking-wider">
            Free Forever
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div
            className={`p-2 rounded-full ${
              isPopular
                ? "bg-purple-600"
                : isFree
                ? "bg-green-600"
                : "bg-gray-800"
            }`}
          >
            <IconComponent size={20} />
          </div>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-gray-400">/month</span>}
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
              : isFree
              ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              : "bg-gray-800 hover:bg-gray-700"
          } transition-colors`}
        >
          Select Plan <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [hasShownWelcomeMessage, setHasShownWelcomeMessage] = useState(false);

  // Check authentication state - fixed to prevent infinite loop
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed in PlansPage:", user);
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hasShownWelcomeMessage) return;

    const urlParams = new URLSearchParams(window.location.search);
    const fromRegistration = urlParams.get("from");

    if (fromRegistration === "signup") {
      toast.info("Please select a subscription plan to activate your account");
      setHasShownWelcomeMessage(true);
    }
  }, [hasShownWelcomeMessage]);

  const plans = [
    {
      title: "Free",
      price: "Free",
      features: [
        "480p Resolution",
        "Basic Video quality",
        "Watch on 1 device",
        "Limited content library",
        "Ad-supported",
      ],
      icon: Coffee,
      isFree: true,
    },
    {
      title: "Basic",
      price: billingCycle === "monthly" ? "$8.99" : "$89.99",
      features: [
        "720p Resolution",
        "Good Video and sound quality",
        "Watch on any device",
        "Cancel anytime",
      ],
      icon: Zap,
    },
    {
      title: "Standard",
      price: billingCycle === "monthly" ? "$13.99" : "$139.99",
      features: [
        "1080p Full HD",
        "Great Video and sound quality",
        "Dolby Atmos 2.0",
        "Watch on 2 devices",
        "Cancel anytime",
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
        "HBO Unlocked",
        "Early access to new releases",
        "Exclusive content",
      ],
      icon: Crown,
    },
  ];

  const handleSelectPlan = useCallback(
    (plan) => {
      setSelectedPlan(plan);
    },
    [currentUser, navigate]
  );

  const handleBack = useCallback(() => {
    setSelectedPlan(null);
  }, []);

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
                Enjoy unlimited movies, TV shows, and immersive experiences on
                any device.
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => (
                <PlanCard
                  key={index}
                  title={plan.title}
                  price={plan.price}
                  features={plan.features}
                  isPopular={plan.isPopular}
                  isFree={plan.isFree}
                  onSelect={() => handleSelectPlan(plan)}
                  icon={plan.icon}
                />
              ))}
            </div>

            <div className="mt-12 bg-gray-900 p-6 rounded-xl max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Award size={20} className="mr-2 text-purple-400" /> All Paid
                Plans Include
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
                  <span>Pay with cryptocurrency</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EthereumCheckoutForm
            selectedPlan={selectedPlan}
            onBack={handleBack}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
