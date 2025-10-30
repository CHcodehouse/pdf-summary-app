// js/enhanced-ux.js - COMPLETE UPDATED VERSION
class EnhancedUX {
    constructor() {
        this.originalButtonTexts = new Map();
        this.toastContainer = null;
        this.init();
    }

    init() {
        this.createToastContainer();
        this.injectStyles();
    }

    // Show loading state for any button
    showLoading(button, loadingText = 'Loading...') {
        if (!button) return;

        // Store original content
        this.originalButtonTexts.set(button, {
            html: button.innerHTML,
            text: button.textContent,
            disabled: button.disabled
        });

        // Set loading state
        button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
        button.disabled = true;
        button.classList.add('loading');
    }

    // Hide loading state and restore original content
    hideLoading(button) {
        if (!button) return;

        const original = this.originalButtonTexts.get(button);
        if (original) {
            button.innerHTML = original.html;
            button.disabled = original.disabled;
            button.classList.remove('loading');
            this.originalButtonTexts.delete(button);
        }
    }

    // Show toast notifications
    showToast(message, type = 'info', duration = 4000) {
        this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)} mr-3"></i>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.toastContainer.appendChild(toast);

        // Add entrance animation
        setTimeout(() => toast.classList.add('toast-visible'), 10);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('toast-visible');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);

        return toast;
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Progress bar functionality
    createProgressBar(container, text = 'Processing...') {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-header">
                <span class="progress-text">${text}</span>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill"></div>
            </div>
        `;
        
        if (container) {
            container.appendChild(progressBar);
        }
        
        return progressBar;
    }

    updateProgressBar(progressBar, percentage, text = null) {
        if (!progressBar) return;

        const fill = progressBar.querySelector('.progress-fill');
        const percentageElement = progressBar.querySelector('.progress-percentage');
        const textElement = progressBar.querySelector('.progress-text');
        
        if (fill) fill.style.width = `${percentage}%`;
        if (percentageElement) percentageElement.textContent = `${Math.round(percentage)}%`;
        if (textElement && text) textElement.textContent = text;
        
        if (percentage >= 100) {
            setTimeout(() => {
                progressBar.classList.add('progress-complete');
                setTimeout(() => {
                    if (progressBar.parentElement) {
                        progressBar.remove();
                    }
                }, 1000);
            }, 500);
        }
    }

    // Create toast container
    createToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
        return this.toastContainer;
    }

    // Show confirmation dialog
    showConfirmation(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirmation-overlay';
            overlay.innerHTML = `
                <div class="confirmation-dialog glass rounded-3xl p-6">
                    <div class="text-center mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-400 text-3xl mb-3"></i>
                        <h3 class="text-xl font-bold text-white mb-2">Confirmation</h3>
                        <p class="text-gray-300">${message}</p>
                    </div>
                    <div class="flex space-x-3">
                        <button class="confirmation-cancel flex-1 py-3 bg-gray-600 rounded-xl font-semibold text-white hover:bg-gray-700 transition-colors">
                            ${cancelText}
                        </button>
                        <button class="confirmation-confirm flex-1 py-3 bg-red-500 rounded-xl font-semibold text-white hover:bg-red-600 transition-colors">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const confirmBtn = overlay.querySelector('.confirmation-confirm');
            const cancelBtn = overlay.querySelector('.confirmation-cancel');

            const cleanup = () => {
                overlay.classList.add('confirmation-hide');
                setTimeout(() => {
                    if (overlay.parentElement) {
                        overlay.remove();
                    }
                }, 300);
            };

            confirmBtn.onclick = () => {
                cleanup();
                resolve(true);
            };

            cancelBtn.onclick = () => {
                cleanup();
                resolve(false);
            };

            // Close on overlay click
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            };
        });
    }

    // Inject CSS styles
    injectStyles() {
        if (document.getElementById('enhanced-ux-styles')) return;

        const styles = `
            /* Loading states */
            button.loading {
                position: relative;
                overflow: hidden;
            }

            button.loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: loadingShine 1.5s infinite;
            }

            @keyframes loadingShine {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            /* Toast notifications */
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            }

            .toast {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease-out;
                pointer-events: all;
                color: #1f2937;
            }

            .toast.toast-visible {
                transform: translateX(0);
                opacity: 1;
            }

            .toast-success {
                border-left: 4px solid #10b981;
            }

            .toast-error {
                border-left: 4px solid #ef4444;
            }

            .toast-warning {
                border-left: 4px solid #f59e0b;
            }

            .toast-info {
                border-left: 4px solid #3b82f6;
            }

            .toast-content {
                display: flex;
                align-items: center;
                flex: 1;
                font-weight: 500;
            }

            .toast-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                margin-left: 12px;
                border-radius: 6px;
                transition: all 0.2s;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .toast-close:hover {
                background-color: rgba(0, 0, 0, 0.1);
                color: #374151;
            }

            /* Progress bar */
            .progress-bar {
                margin: 20px 0;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .progress-text {
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
            }

            .progress-percentage {
                color: rgba(255, 255, 255, 0.7);
                font-weight: 600;
            }

            .progress-track {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #6366f1, #8b5cf6);
                border-radius: 3px;
                transition: width 0.3s ease;
                width: 0%;
            }

            .progress-bar.progress-complete .progress-fill {
                background: linear-gradient(90deg, #10b981, #059669);
            }

            /* Confirmation dialog */
            .confirmation-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
                opacity: 1;
                transition: opacity 0.3s ease;
            }

            .confirmation-overlay.confirmation-hide {
                opacity: 0;
            }

            .confirmation-dialog {
                max-width: 400px;
                width: 100%;
                animation: dialogEnter 0.3s ease-out;
            }

            @keyframes dialogEnter {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* Responsive design */
            @media (max-width: 640px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .confirmation-dialog {
                    margin: 20px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'enhanced-ux-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Utility: Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility: Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Utility: Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        } catch (err) {
            this.showToast('Failed to copy to clipboard', 'error');
            return false;
        }
    }
}

// Initialize enhanced UX globally
const enhancedUX = new EnhancedUX();