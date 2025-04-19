// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SubscriptionPayment {
    address public owner;
    address public serviceWallet;

    event PaymentReceived(address indexed subscriber, uint256 amount, string planName);
    event ServiceWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event PlanAdded(string name, uint256 price);
    event PlanUpdated(string name, uint256 price, bool active);

    struct Plan {
        string name;
        uint256 priceInWei;
        bool active;
    }

    mapping(bytes32 => Plan) public plans;

    constructor(address _serviceWallet) {
        require(_serviceWallet != address(0), "SubscriptionPayment: Invalid service wallet address");
        owner = msg.sender;
        serviceWallet = _serviceWallet;
        
        // Add all plans including Free plan to match frontend expectations
        _addPlan("Free", 0 ether);
        _addPlan("Basic", 0.003 ether);
        _addPlan("Standard", 0.0047 ether);
        _addPlan("Premium", 0.006 ether);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "SubscriptionPayment: Not authorized");
        _;
    }

    function _addPlan(string memory _name, uint256 _priceInWei) internal {
        bytes32 planId = keccak256(abi.encodePacked(_name));
        plans[planId] = Plan({
            name: _name,
            priceInWei: _priceInWei,
            active: true
        });
        emit PlanAdded(_name, _priceInWei);
    }

    function addPlan(string memory _name, uint256 _priceInWei) external onlyOwner {
        _addPlan(_name, _priceInWei);
    }

    function setPlanStatus(string memory _name, bool _active) external onlyOwner {
        bytes32 planId = keccak256(abi.encodePacked(_name));
        require(bytes(plans[planId].name).length > 0, "SubscriptionPayment: Plan does not exist");
        plans[planId].active = _active;
        emit PlanUpdated(plans[planId].name, plans[planId].priceInWei, _active);
    }

    function updatePlanPrice(string memory _name, uint256 _newPriceInWei) external onlyOwner {
        bytes32 planId = keccak256(abi.encodePacked(_name));
        require(bytes(plans[planId].name).length > 0, "SubscriptionPayment: Plan does not exist");
        plans[planId].priceInWei = _newPriceInWei;
        emit PlanUpdated(plans[planId].name, _newPriceInWei, plans[planId].active);
    }

    function updateServiceWallet(address _newServiceWallet) external onlyOwner {
        require(_newServiceWallet != address(0), "SubscriptionPayment: Invalid address");
        address oldWallet = serviceWallet;
        serviceWallet = _newServiceWallet;
        emit ServiceWalletUpdated(oldWallet, _newServiceWallet);
    }

    function processPayment(string memory _planName) external payable {
        bytes32 planId = keccak256(abi.encodePacked(_planName));
        require(bytes(plans[planId].name).length > 0, "SubscriptionPayment: Invalid plan");
        require(plans[planId].active, "SubscriptionPayment: Plan is not active");
        
        // For Free plan, no payment is required
        if (keccak256(abi.encodePacked(_planName)) == keccak256(abi.encodePacked("Free"))) {
            emit PaymentReceived(msg.sender, 0, _planName);
            return;
        }
        
        require(msg.value >= plans[planId].priceInWei, "SubscriptionPayment: Insufficient payment amount");
        (bool success, ) = payable(serviceWallet).call{value: msg.value}("");
        require(success, "SubscriptionPayment: Payment transfer failed");
        emit PaymentReceived(msg.sender, msg.value, _planName);
    }

    function getPlanDetails(string memory _planName) external view returns (string memory name, uint256 price, bool active) {
        bytes32 planId = keccak256(abi.encodePacked(_planName));
        Plan memory plan = plans[planId];
        require(bytes(plan.name).length > 0, "SubscriptionPayment: Plan does not exist");
        return (plan.name, plan.priceInWei, plan.active);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "SubscriptionPayment: No funds to withdraw");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "SubscriptionPayment: Withdrawal failed");
    }
}
