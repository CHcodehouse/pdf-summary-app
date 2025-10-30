// js/export-utils.js - FIXED VERSION
class ExportUtils {
    constructor() {
        this.exportFormats = [
            // ... formats array remains the same ...
        ];
        
        this.exportHistory = [];
        this.currentModal = null;
        this.init();
    }

    init() {
        this.loadExportHistory();
        this.injectStyles();
    }

    // ADD THIS METHOD: Inject necessary CSS styles
    injectStyles() {
        if (document.getElementById('export-utils-styles')) return;

        const styles = `
            .export-modal-overlay {
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

            .export-modal {
                max-width: 600px;
                width: 100%;
                animation: modalEnter 0.3s ease-out;
            }

            .export-format-btn {
                min-height: 120px;
                transition: all 0.3s ease;
            }

            .export-format-btn:hover {
                transform: translateY(-2px);
            }

            @keyframes modalEnter {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            @media (max-width: 768px) {
                .export-modal {
                    margin: 10px;
                }
                
                .export-format-btn {
                    min-height: 100px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'export-utils-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // FIXED: Show export modal with proper initialization
    showExportModal(content, fileName, metadata = {}) {
        // Close any existing modal first
        this.closeExportModal();

        const modal = document.createElement('div');
        modal.className = 'export-modal-overlay';
        modal.innerHTML = `
            <div class="export-modal glass rounded-3xl p-8 max-w-2xl w-full mx-4">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white mb-2">Export Summary</h3>
                        <p class="text-gray-300">Choose your preferred format</p>
                    </div>
                    <button onclick="exportUtils.closeExportModal()" 
                            class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    ${this.exportFormats.map(format => {
                        const colorClass = this.getFormatColorClass(format.id);
                        return `
                            <button onclick="exportUtils.handleExport('${format.id}')" 
                                    class="export-format-btn p-4 glass rounded-xl flex flex-col items-center text-center hover:scale-105 transition-all duration-200 group border-2 border-transparent hover:border-white/10">
                                <i class="${format.icon} ${colorClass} text-2xl mb-3 group-hover:scale-110 transition-transform"></i>
                                <div class="font-semibold text-white mb-1">${format.name}</div>
                                <div class="text-gray-400 text-sm">${format.description}</div>
                                <div class="text-gray-500 text-xs mt-2">${format.extension}</div>
                            </button>
                        `;
                    }).join('')}
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="exportUtils.closeExportModal()" 
                            class="flex-1 py-3 bg-gray-600 rounded-xl font-semibold text-white hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        // Store data for export
        modal._exportContent = content;
        modal._fileName = fileName;
        modal._metadata = {
            ...metadata,
            summaryType: window.summaryTypes ? summaryTypes.getTypeName(summaryTypes.selectedType) : 'Brief Summary',
            originalFileName: fileName
        };
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeExportModal();
            }
        });

        // Escape key handler
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeExportModal();
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
        modal._escapeHandler = escapeHandler;

        this.currentModal = modal;
        console.log('Export modal shown');
    }

    // Helper method for format colors
    getFormatColorClass(formatId) {
        const colors = {
            txt: 'text-blue-400',
            pdf: 'text-red-400',
            docx: 'text-blue-400',
            html: 'text-orange-400',
            json: 'text-yellow-400',
            md: 'text-gray-400'
        };
        return colors[formatId] || 'text-gray-400';
    }

    // FIXED: Close export modal properly
    closeExportModal() {
        if (this.currentModal) {
            // Remove escape handler
            if (this.currentModal._escapeHandler) {
                document.removeEventListener('keydown', this.currentModal._escapeHandler);
            }
            
            // Remove modal from DOM
            this.currentModal.remove();
            this.currentModal = null;
            console.log('Export modal closed');
        }
    }

    // FIXED: Handle export with better error handling
    async handleExport(format) {
        if (!this.currentModal) {
            console.error('No export modal found');
            return;
        }

        const content = this.currentModal._exportContent;
        const fileName = this.currentModal._fileName;
        const metadata = this.currentModal._metadata;

        if (!content) {
            console.error('No content to export');
            if (window.enhancedUX) {
                enhancedUX.showToast('No content available for export', 'error');
            }
            return;
        }

        try {
            await this.exportSummary(content, format, fileName, metadata);
            this.closeExportModal();
        } catch (error) {
            console.error('Export failed:', error);
            // Error is already handled in exportSummary method
        }
    }

    // ... rest of the methods remain the same ...
}

// Initialize export utils
const exportUtils = new ExportUtils();