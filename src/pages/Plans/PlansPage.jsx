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

const EthereumCheckoutForm = ({ selectedPlan, onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [ethereumAddress, setEthereumAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [contractEthAmount, setContractEthAmount] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      setCurrentUser(user);

      if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          name: user.displayName || "",
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadContractData = async () => {
      if (!walletConnected || !window.ethereum || !selectedPlan) return;
      if (selectedPlan.title === "Free") {
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        if (
          !CONTRACT_ADDRESS ||
          CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
        ) {
          throw new Error("Contract address is not configured properly");
        }

        const subscriptionContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          SubscriptionPaymentABI.abi,
          signer
        );

        setContract(subscriptionContract);

        try {
          const planDetails = await subscriptionContract.getPlanDetails(
            selectedPlan.title
          );
          const ethPrice = ethers.formatEther(planDetails.price);
          setContractEthAmount(ethPrice);
        } catch (contractErr) {
          console.error("Error getting plan details:", contractErr);
          setContractEthAmount(
            selectedPlan.title === "Basic"
              ? "0.005"
              : selectedPlan.title === "Standard"
              ? "0.008"
              : "0.01"
          );
        }
      } catch (err) {
        console.error("Error loading contract data:", err);
        setError(
          "Failed to load plan details from smart contract: " + err.message
        );
        setContractEthAmount(
          selectedPlan.title === "Basic"
            ? "0.005"
            : selectedPlan.title === "Standard"
            ? "0.008"
            : "0.01"
        );
      }
    };

    if (walletConnected) {
      loadContractData();
    }
  }, [walletConnected, selectedPlan]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setEthereumAddress(accounts[0]);
        setWalletConnected(true);
        setLoading(false);
      } catch (error) {
        setError("Failed to connect wallet. Please try again.");
        setLoading(false);
      }
    } else {
      setError(
        "Ethereum wallet not detected. Please install MetaMask or another Ethereum wallet extension."
      );
    }
  };
  const updateUserStatus = async (userId, planInfo) => {
    console.log("Updating user status for:", userId);
    console.log("Plan info:", planInfo);

    try {
      // First check if the document exists
      const userDocRef = doc(db, "Users", userId);
      const userDoc = await getDoc(userDocRef);

      // Check if status is already true to prevent unnecessary updates
      if (userDoc.exists() && userDoc.data().status === true) {
        console.log("Status already true, skipping update");
        setStatusUpdateSuccess(true);
        return true;
      }

      const updateData = {
        status: true,
        plan: planInfo.title,
        planActivatedAt: new Date().toISOString(),
        ...(ethereumAddress && { ethAddress: ethereumAddress }),
      };

      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userDocRef, updateData);
        console.log("User document updated successfully");

        // Verify the update was successful
        const updatedDoc = await getDoc(userDocRef);
        if (updatedDoc.exists() && updatedDoc.data().status === true) {
          console.log("Status update verified successfully");
          setStatusUpdateSuccess(true);
          return true;
        } else {
          console.error("Status update verification failed");
          return false;
        }
      } else {
        // Create new document if it doesn't exist
        await setDoc(userDocRef, {
          email: formData.email,
          userName: formData.name,
          status: true,
          plan: planInfo.title,
          planActivatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...(ethereumAddress && { ethAddress: ethereumAddress }),
        });
        console.log("User document created successfully");

        // Verify the document was created with status true
        const newDoc = await getDoc(userDocRef);
        if (newDoc.exists() && newDoc.data().status === true) {
          console.log("Status update verified successfully");
          setStatusUpdateSuccess(true);
          return true;
        } else {
          console.error("Status update verification failed");
          return false;
        }
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      return false;
    }
  };

  // For free plan, just handle registration
  const handleFreePlan = async () => {
    setLoading(true);
    setPaymentStatus("processing");
    setError(null);

    // Verify user is authenticated
    if (!currentUser) {
      setError("You must be logged in to select a plan. Please log in first.");
      setLoading(false);
      setPaymentStatus("idle");
      return;
    }

    try {
      // Update user status in Firestore
      const success = await updateUserStatus(currentUser.uid, selectedPlan);

      if (success) {
        setPaymentStatus("success");
        toast.success("Free plan activated!");
      } else {
        throw new Error("Failed to update subscription status");
      }
    } catch (error) {
      console.error("Free plan activation error:", error);
      setError("Could not activate free plan: " + error.message);
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      // Set current user
      setCurrentUser(userCredential.user);

      // Proceed with subscription after signup
      if (selectedPlan.title === "Free") {
        handleFreePlan();
      } else {
        // Show wallet connection UI
        toast.success(
          "Account created! Please connect your wallet to complete your subscription."
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to create account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify user is authenticated
    if (!currentUser) {
      setError("You must be logged in to select a plan. Please log in first.");
      return;
    }

    // If it's the free plan, use a different handler
    if (selectedPlan.title === "Free") {
      handleFreePlan();
      return;
    }

    if (!walletConnected) {
      setError("Please connect your Ethereum wallet first.");
      return;
    }

    if (!contractEthAmount) {
      setError("Payment amount not properly initialized.");
      return;
    }

    setLoading(true);
    setPaymentStatus("processing");
    setError(null);

    try {
      // Process payment through the smart contract
      const amountInWei = ethers.parseEther(contractEthAmount);

      // If contract is not available, handle the error
      if (!contract) {
        throw new Error(
          "Contract not properly initialized. Using direct transfer instead."
        );
      }

      // Try to use the contract first
      try {
        // Call the processPayment function on the contract using ethers v6 syntax
        const tx = await contract.processPayment(selectedPlan.title, {
          value: amountInWei,
        });

        // Wait for the transaction to be mined
        await tx.wait();
        console.log("Transaction hash:", tx.hash);
      } catch (contractError) {
        console.error(
          "Contract payment failed, falling back to direct transfer:",
          contractError
        );

        // Fallback: Direct transfer if contract fails
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Send ETH directly to the contract address
        const tx = await signer.sendTransaction({
          to: CONTRACT_ADDRESS,
          value: amountInWei,
        });

        await tx.wait();
        console.log("Direct transfer hash:", tx.hash);
      }

      // Payment successful
      setPaymentStatus("success");

      // After payment success, update user status in Firestore
      const success = await updateUserStatus(currentUser.uid, selectedPlan);

      if (success) {
        toast.success("Subscription activated!");
      } else {
        console.error("Failed to update user status after successful payment");
        toast.warning(
          "Payment successful, but subscription status update failed. Please contact support."
        );
      }

      // Store user data and subscription info in localStorage
      localStorage.setItem(
        "userSubscription",
        JSON.stringify({
          plan: selectedPlan.title,
          email: formData.email,
          name: formData.name,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "Payment failed. Please try again.");
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  // If payment was successful, show success message
  if (paymentStatus === "success") {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-green-900 bg-opacity-30 p-8 rounded-xl border border-green-500">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Registration Successful!</h3>
          <p className="mb-6">
            Thank you for subscribing to our {selectedPlan.title} plan. You now
            have access to all the features included in your subscription.
            {statusUpdateSuccess && (
              <span className="block mt-2 text-green-300">
                Your account has been activated successfully.
              </span>
            )}
          </p>
          <a
            href="/login"
            className="inline-block py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Whether to show the wallet connection UI
  const showWalletUI = selectedPlan && selectedPlan.title !== "Free";

  // If user is not authenticated, show login prompt
  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
          <h3 className="text-2xl font-bold mb-4">Authentication Required</h3>
          <p className="mb-6">
            You need to be logged in to select a subscription plan. Please sign
            up or log in first.
          </p>
          <div className="flex space-x-4 justify-center">
            <a
              href="/signup"
              className="py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold transition-colors"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="py-3 px-6 rounded-lg bg-gray-800 hover:bg-gray-700 font-bold transition-colors"
            >
              Log In
            </a>
          </div>
          <button
            onClick={onBack}
            className="mt-4 text-purple-400 hover:text-purple-300 flex items-center mx-auto"
          >
            <ArrowRight size={16} className="mr-2 transform rotate-180" /> Back
            to plans
          </button>
        </div>
      </div>
    );
  }

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
        {contractEthAmount && selectedPlan.title !== "Free" && (
          <div className="flex justify-between py-3 border-b border-gray-800">
            <span>ETH Equivalent</span>
            <span className="font-bold">{contractEthAmount} ETH</span>
          </div>
        )}
        <div className="flex justify-between py-3 text-lg font-bold">
          <span>Total</span>
          <span>{selectedPlan.price}/month</span>
        </div>
      </div>

      <div className="bg-black p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Subscription Details</h3>
        <div className="bg-gray-900 p-3 rounded-lg mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Logged in as:</span>
            <span>{currentUser.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1 text-gray-300"
              >
                Name
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

            {showWalletUI && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="font-medium mb-2 flex items-center">
                  <Wallet size={18} className="mr-2" /> Ethereum Payment
                </h4>

                {!walletConnected ? (
                  <button
                    type="button"
                    onClick={connectWallet}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold flex items-center justify-center transition-colors"
                  >
                    {loading ? "Connecting..." : "Connect Ethereum Wallet"}
                  </button>
                ) : (
                  <div className="p-3 bg-gray-900 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Connected Address:</span>
                      <span className="font-mono text-sm">
                        {ethereumAddress.slice(0, 6)}...
                        {ethereumAddress.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Amount:</span>
                      <span className="font-bold">
                        {contractEthAmount || "Loading..."} ETH
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={
                (!walletConnected && selectedPlan.title !== "Free") ||
                loading ||
                (selectedPlan.title !== "Free" && !contractEthAmount)
              }
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold flex items-center justify-center transition-colors disabled:opacity-70"
            >
              {loading
                ? "Processing..."
                : selectedPlan.title === "Free"
                ? "Get Free Access"
                : "Pay with Ethereum"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
          {selectedPlan.title !== "Free" && (
            <p className="mt-2">
              Your subscription will automatically renew each month unless
              canceled.
            </p>
          )}
        </div>
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

  // Check URL for registration redirect - fixed to prevent infinite loop
  useEffect(() => {
    if (hasShownWelcomeMessage) return;

    const urlParams = new URLSearchParams(window.location.search);
    const fromRegistration = urlParams.get("from");

    if (fromRegistration === "signup") {
      // If coming from signup, show a welcome message or highlight the free plan
      toast.info("Please select a subscription plan to activate your account");
      setHasShownWelcomeMessage(true);
    }
  }, [hasShownWelcomeMessage]);

  // Enhanced plans with free tier and more details
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

  // Use useCallback to prevent unnecessary re-renders
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
                Enjoy unlimited movies, TV shows, and immersive
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

      <Footer/>
    </div>
  );
}