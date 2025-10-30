function showSubscriptionModal() {
  document.getElementById('subscription-modal').classList.remove('hidden');
}

function hideSubscriptionModal() {
  document.getElementById('subscription-modal').classList.add('hidden');
}

function subscribe() {
  // For demo purposes - in real app, integrate with Stripe
  alert('Subscription feature would integrate with Stripe in production');
  hideSubscriptionModal();
}

// Check if user can access detailed summaries
function updateSubscriptionUI() {
  const detailedOption = document.getElementById('detailed-option');
  
  // In real app, check user's subscription status from backend
  const isSubscribed = false; // This would come from backend
  
  if (!isSubscribed) {
    detailedOption.classList.add('opacity-50', 'cursor-not-allowed');
    detailedOption.querySelector('input').disabled = true;
  }
}