// js/summary-types.js - SIMPLIFIED WORKING VERSION
class SummaryTypes {
    constructor() {
        this.types = [
            {
                id: "brief",
                name: "Brief Summary",
                description: "Quick overview (2-3 sentences)",
                icon: "fas fa-bolt",
                color: "blue"
            },
            {
                id: "detailed",
                name: "Detailed Summary", 
                description: "Comprehensive analysis (5-8 sentences)",
                icon: "fas fa-chart-bar",
                color: "purple"
            },
            {
                id: "bullet",
                name: "Bullet Points",
                description: "Key points in bullet format", 
                icon: "fas fa-list",
                color: "green"
            },
            {
                id: "executive", 
                name: "Executive Summary",
                description: "High-level overview for executives",
                icon: "fas fa-chart-line",
                color: "orange"
            },
            {
                id: "chapter",
                name: "Chapter-wise Summary",
                description: "Summary for each chapter/section",
                icon: "fas fa-book",
                color: "indigo"
            },
            {
                id: "qa",
                name: "Q&A Format", 
                description: "Questions and answers from content",
                icon: "fas fa-question-circle",
                color: "pink"
            }
        ];

        this.selectedType = "brief";
    }

    // Simple render method
    renderOptions(container) {
        if (!container) {
            console.error('Container not found for summary types');
            return;
        }

        container.innerHTML = this.types.map(type => {
            const isSelected = this.selectedType === type.id;
            return `
                <div class="summary-type-option glass rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                    isSelected ? 'border-indigo-400 bg-indigo-500/10 shadow-lg' : 'border-transparent'
                }" 
                     onclick="summaryTypes.selectType('${type.id}')"
                     data-type="${type.id}">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-${type.color}-500 rounded-lg flex items-center justify-center">
                            <i class="${type.icon} text-white"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-white text-lg">${type.name}</h3>
                            <p class="text-gray-400 text-sm">${type.description}</p>
                        </div>
                        <div class="summary-type-check">
                            <i class="fas fa-check text-${type.color}-400 ${
                                isSelected ? 'opacity-100' : 'opacity-0'
                            } transition-opacity"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        console.log('Summary types rendered successfully');
    }

    // Simple select method
    selectType(typeId) {
        this.selectedType = typeId;
        
        // Update all options
        document.querySelectorAll('.summary-type-option').forEach(option => {
            const optionType = option.getAttribute('data-type');
            const isSelected = optionType === typeId;
            
            if (isSelected) {
                option.classList.add('border-indigo-400', 'bg-indigo-500/10', 'shadow-lg');
                option.classList.remove('border-transparent');
                option.querySelector('.summary-type-check i').classList.remove('opacity-0');
                option.querySelector('.summary-type-check i').classList.add('opacity-100');
            } else {
                option.classList.remove('border-indigo-400', 'bg-indigo-500/10', 'shadow-lg');
                option.classList.add('border-transparent');
                option.querySelector('.summary-type-check i').classList.remove('opacity-100');
                option.querySelector('.summary-type-check i').classList.add('opacity-0');
            }
        });

        console.log('Selected summary type:', typeId);
        
        if (window.enhancedUX) {
            enhancedUX.showToast(`Selected: ${this.getTypeName(typeId)}`, 'info', 2000);
        }
    }

    getTypeName(typeId) {
        const type = this.types.find(t => t.id === typeId);
        return type ? type.name : 'Brief Summary';
    }

    autoSelectType(validationResult) {
        // Simple auto-selection logic
        if (validationResult.pages > 20) {
            this.selectType('executive');
        } else if (validationResult.pages > 10) {
            this.selectType('bullet');
        } else {
            this.selectType('detailed');
        }
    }
}

// Initialize summary types
const summaryTypes = new SummaryTypes();