// js/file-validation.js - COMPLETE UPDATED VERSION
class FileValidation {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['application/pdf'];
        this.maxPages = 100; // Maximum pages to process
        this.allowedExtensions = ['.pdf'];
    }

    // Comprehensive PDF validation
    async validatePDF(file) {
        try {
            // Basic validation
            this.validateBasic(file);
            
            // File type validation
            this.validateFileType(file);
            
            // File size validation
            this.validateFileSize(file);
            
            // Security checks
            await this.securityChecks(file);
            
            // PDF structure validation
            const pdfInfo = await this.validatePDFStructure(file);
            
            return {
                isValid: true,
                file: file,
                pages: pdfInfo.pages,
                size: file.size,
                name: file.name,
                message: 'PDF file is valid and safe to process',
                hasText: pdfInfo.hasText,
                isScanned: pdfInfo.isScanned
            };
            
        } catch (error) {
            return {
                isValid: false,
                error: error.message,
                file: file
            };
        }
    }

    // Basic file validation
    validateBasic(file) {
        if (!file) {
            throw new Error('No file selected');
        }

        if (file.size === 0) {
            throw new Error('File appears to be empty');
        }

        if (file.name.length > 255) {
            throw new Error('File name is too long');
        }

        // Check for double extensions (e.g., .pdf.exe)
        const fileName = file.name.toLowerCase();
        if ((fileName.match(/\./g) || []).length > 1) {
            const lastDotIndex = fileName.lastIndexOf('.');
            const secondLastDotIndex = fileName.lastIndexOf('.', lastDotIndex - 1);
            if (secondLastDotIndex !== -1) {
                throw new Error('File name contains multiple extensions');
            }
        }

        // Check for valid PDF extension
        if (!this.allowedExtensions.some(ext => fileName.endsWith(ext))) {
            throw new Error('File must have .pdf extension');
        }
    }

    // File type validation
    validateFileType(file) {
        // Check MIME type
        if (!this.allowedTypes.includes(file.type) && file.type !== '') {
            throw new Error('Only PDF files are allowed');
        }

        // Additional check for empty type (some browsers don't set MIME for PDFs)
        if (file.type === '' && !file.name.toLowerCase().endsWith('.pdf')) {
            throw new Error('Invalid file type');
        }
    }

    // File size validation
    validateFileSize(file) {
        if (file.size > this.maxFileSize) {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(2);
            throw new Error(`File size (${sizeInMB}MB) exceeds maximum limit (${maxSizeMB}MB)`);
        }

        if (file.size < 100) { // Minimum 100 bytes
            throw new Error('File is too small to be a valid PDF');
        }
    }

    // Security checks
    async securityChecks(file) {
        try {
            const buffer = await this.readFileChunk(file, 0, 1024); // First 1KB
            
            // PDF header check (should start with %PDF)
            const header = new TextDecoder('ascii').decode(buffer.slice(0, 8));
            if (!header.includes('%PDF')) {
                throw new Error('Invalid PDF file: Missing PDF header');
            }

            // Check PDF version
            const versionMatch = header.match(/%PDF-(\d\.\d)/);
            if (!versionMatch) {
                throw new Error('Invalid PDF version format');
            }

            const version = parseFloat(versionMatch[1]);
            if (version < 1.0 || version > 2.0) {
                throw new Error(`Unsupported PDF version: ${version}`);
            }

            // Check for embedded scripts or dangerous objects
            const content = new TextDecoder('ascii').decode(buffer);
            const dangerousPatterns = [
                /\/JavaScript/i,
                /\/Launch/i,
                /\/EmbeddedFile/i,
                /\/RichMedia/i,
                /\/AA\s*\/O/i, // Open actions
                /\/SubmitForm/i,
                /\/GoTo/i,
                /\/URI/i
            ];

            for (const pattern of dangerousPatterns) {
                if (pattern.test(content)) {
                    throw new Error('PDF contains potentially unsafe elements');
                }
            }

            return true;
        } catch (error) {
            throw new Error('Security check failed: ' + error.message);
        }
    }

    // Validate PDF structure
    async validatePDFStructure(file) {
        try {
            const buffer = await this.readFileChunk(file, 0, 4096); // First 4KB
            const content = new TextDecoder('ascii').decode(buffer);
            
            // Basic PDF structure checks
            const requiredElements = ['/Type', '/Pages', '/Count', '/Kids'];
            const hasRequiredElements = requiredElements.some(element => content.includes(element));
            
            if (!hasRequiredElements && !content.includes('/Page')) {
                throw new Error('Invalid PDF structure: Missing required elements');
            }

            // Count pages (approximate)
            const pageCount = this.estimatePageCount(content);
            
            if (pageCount > this.maxPages) {
                throw new Error(`PDF has too many pages (${pageCount}). Maximum allowed: ${this.maxPages}`);
            }

            // Check if PDF might be scanned (image-based)
            const isScanned = this.checkIfScanned(content);
            const hasText = content.includes('/Font') || content.includes('/Text');

            return {
                pages: pageCount,
                hasText: hasText,
                isScanned: isScanned
            };

        } catch (error) {
            throw new Error('Unable to read PDF structure: ' + error.message);
        }
    }

    // Estimate page count from PDF content
    estimatePageCount(content) {
        // Method 1: Look for /Count
        const countMatch = content.match(/\/Count\s+(\d+)/);
        if (countMatch) {
            return parseInt(countMatch[1]);
        }

        // Method 2: Count /Type/Page occurrences
        const pageMatches = content.match(/\/Type\s*\/Page/g);
        if (pageMatches) {
            return pageMatches.length;
        }

        // Method 3: Count /Page occurrences (fallback)
        const simplePageMatches = content.match(/\/Page\b/g);
        if (simplePageMatches) {
            return simplePageMatches.length;
        }

        return 1; // Default assumption
    }

    // Check if PDF might be scanned (image-based)
    checkIfScanned(content) {
        const imageIndicators = [
            /\/XObject/i,
            /\/Image/i,
            /\/JBIG2Decode/i,
            /\/JPXDecode/i,
            /\/DCTDecode/i
        ];

        const hasImages = imageIndicators.some(pattern => pattern.test(content));
        const hasText = content.includes('/Font') || content.includes('/Text');
        
        return hasImages && !hasText;
    }

    // Read a chunk of the file
    readFileChunk(file, start, end) {
        return new Promise((resolve, reject) => {
            const slice = file.slice(start, end);
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(new Uint8Array(e.target.result));
            reader.onerror = () => reject(new Error('Failed to read file chunk'));
            reader.readAsArrayBuffer(slice);
        });
    }

    // Get file info for display
    getFileInfo(file) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        const lastModified = new Date(file.lastModified).toLocaleDateString();
        
        return {
            name: file.name,
            size: sizeInMB + ' MB',
            type: file.type || 'application/pdf',
            lastModified: lastModified,
            pages: 'Checking...' // Will be updated after validation
        };
    }

    // Sanitize filename
    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace special chars with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .substring(0, 100); // Limit length
    }

    // Check if file is password protected (basic check)
    async checkPasswordProtected(file) {
        try {
            const buffer = await this.readFileChunk(file, 0, 1024);
            const content = new TextDecoder('ascii').decode(buffer);
            
            // Look for encryption dictionary
            if (content.includes('/Encrypt') || content.includes('/Crypt')) {
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('Could not check password protection:', error);
            return false;
        }
    }

    // Validate multiple files
    async validateMultipleFiles(files) {
        const results = [];
        
        for (const file of files) {
            const result = await this.validatePDF(file);
            results.push(result);
        }
        
        return results;
    }

    // Get validation rules for UI display
    getValidationRules() {
        return {
            maxFileSize: this.maxFileSize,
            allowedTypes: this.allowedTypes,
            maxPages: this.maxPages,
            allowedExtensions: this.allowedExtensions
        };
    }

    // Format validation rules for display
    getFormattedRules() {
        const rules = this.getValidationRules();
        return {
            maxSize: enhancedUX.formatFileSize(rules.maxFileSize),
            allowedTypes: rules.allowedTypes.join(', '),
            maxPages: rules.maxPages,
            allowedExtensions: rules.allowedExtensions.join(', ')
        };
    }
}

// Initialize file validation
const fileValidator = new FileValidation();

// Enhanced file info display
function displayFileInfo(fileInfo, validationResult) {
    const fileInfoElement = document.getElementById('file-info');
    
    const statusIcon = validationResult.isValid ? 
        '<i class="fas fa-check-circle text-green-400"></i>' : 
        '<i class="fas fa-exclamation-circle text-red-400"></i>';
    
    const statusText = validationResult.isValid ? 
        '<span class="text-green-400">Valid PDF</span>' : 
        '<span class="text-red-400">Invalid File</span>';
    
    const warningSection = !validationResult.isValid ? `
        <div class="mt-3 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
            <div class="flex items-center text-red-300 text-sm">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                ${validationResult.error}
            </div>
        </div>
    ` : '';
    
    const scannedWarning = validationResult.isScanned ? `
        <div class="mt-2 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
            <div class="flex items-center text-yellow-300 text-sm">
                <i class="fas fa-image mr-2"></i>
                This appears to be a scanned PDF. Text extraction may be limited.
            </div>
        </div>
    ` : '';

    fileInfoElement.innerHTML = `
        <div class="file-info-content">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-file-pdf text-red-400 text-xl"></i>
                    <div>
                        <div class="text-white font-semibold truncate max-w-[200px]">${fileInfo.name}</div>
                        <div class="text-gray-400 text-sm">
                            ${fileInfo.size} • ${validationResult.pages || fileInfo.pages} pages • ${fileInfo.lastModified}
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${staztusIcon}
                    ${statusText}
                    <button onclick="clearFile()" class="text-gray-400 hover:text-white transition-colors ml-2">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            ${scannedWarning}
            ${warningSection}
        </div>
    `;
    
    fileInfoElement.classList.remove('hidden');
}