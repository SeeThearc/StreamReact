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
      const userDocRef = doc(db, "Users", userId);
      const userDoc = await getDoc(userDocRef);

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
        await updateDoc(userDocRef, updateData);
        console.log("User document updated successfully");

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

  const handleFreePlan = async () => {
    setLoading(true);
    setPaymentStatus("processing");
    setError(null);

    if (!currentUser) {
      setError("You must be logged in to select a plan. Please log in first.");
      setLoading(false);
      setPaymentStatus("idle");
      return;
    }

    try {
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      setCurrentUser(userCredential.user);

      if (selectedPlan.title === "Free") {
        handleFreePlan();
      } else {
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

    if (!currentUser) {
      setError("You must be logged in to select a plan. Please log in first.");
      return;
    }

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
      const amountInWei = ethers.parseEther(contractEthAmount);

      if (!contract) {
        throw new Error(
          "Contract not properly initialized. Using direct transfer instead."
        );
      }

      try {
        const tx = await contract.processPayment(selectedPlan.title, {
          value: amountInWei,
        });

        await tx.wait();
        console.log("Transaction hash:", tx.hash);
      } catch (contractError) {
        console.error(
          "Contract payment failed, falling back to direct transfer:",
          contractError
        );

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
          to: CONTRACT_ADDRESS,
          value: amountInWei,
        });

        await tx.wait();
        console.log("Direct transfer hash:", tx.hash);
      }

      setPaymentStatus("success");

      const success = await updateUserStatus(currentUser.uid, selectedPlan);

      if (success) {
        toast.success("Subscription activated!");
      } else {
        console.error("Failed to update user status after successful payment");
        toast.warning(
          "Payment successful, but subscription status update failed. Please contact support."
        );
      }

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

  const showWalletUI = selectedPlan && selectedPlan.title !== "Free";

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

export default EthereumCheckoutForm;
