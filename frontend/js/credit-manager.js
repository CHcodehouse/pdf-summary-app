class CreditManager {
  static async getUserCredits() {
    try {
      const response = await fetch('/api/credits/balance', {
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching credits:', error);
      return { credits: 0 };
    }
  }

  static async updateCreditDisplay() {
    const creditBalance = document.getElementById('creditBalance');
    if (creditBalance) {
      const credits = await this.getUserCredits();
      creditBalance.textContent = credits.credits;
    }
  }

  static showInsufficientCreditsModal(required, current) {
    // Show modal prompting user to purchase more credits
    const modal = document.getElementById('insufficientCreditsModal');
    if (modal) {
      document.getElementById('requiredCredits').textContent = required;
      document.getElementById('currentCredits').textContent = current;
      modal.style.display = 'block';
    }
  }
}