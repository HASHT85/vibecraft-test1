// Contact Form Handler with Advanced Client-Side Validation

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});

function initContactForm() {
    const form = document.querySelector('#contact-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        form.addEventListener('reset', handleFormReset);
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', handleFieldInput);
            input.addEventListener('focus', handleFieldFocus);
        });
        
        // Character counter for message field
        const messageField = form.querySelector('#message');
        if (messageField) {
            addCharacterCounter(messageField);
        }
        
        console.log('✅ Contact form initialized with advanced validation');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Clear previous messages
    clearFormMessage();
    
    // Validate entire form before submission
    if (!validateForm(form)) {
        showMessage('Veuillez corriger les erreurs dans le formulaire.', 'error');
        return;
    }
    
    // Show loading state
    setSubmitButtonState(submitButton, 'loading');
    
    try {
        // In production, replace with actual endpoint
        await simulateFormSubmission(formData);
        
        showMessage('✨ Message envoyé avec succès ! Je vous répondrai rapidement.', 'success');
        form.reset();
        clearAllFieldErrors(form);
        
        // Reset character counter
        const messageField = form.querySelector('#message');
        if (messageField) {
            updateCharacterCounter(messageField);
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('❌ Erreur lors de l\'envoi. Veuillez réessayer plus tard.', 'error');
    } finally {
        setSubmitButtonState(submitButton, 'default');
    }
}

function handleFormReset(e) {
    const form = e.target;
    
    // Clear all errors and success states
    clearAllFieldErrors(form);
    clearFormMessage();
    
    // Reset character counter
    const messageField = form.querySelector('#message');
    if (messageField) {
        setTimeout(() => {
            updateCharacterCounter(messageField);
        }, 10); // Small delay to ensure form is reset
    }
    
    console.log('Form reset');
}

function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('[required]');
    
    fields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Clear existing error
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'Ce champ est requis.';
        isValid = false;
    }
    // Email validation
    else if (fieldName === 'email' && value) {
        if (!isValidEmail(value)) {
            errorMessage = 'Veuillez entrer une adresse email valide.';
            isValid = false;
        }
    }
    // Name validation
    else if (fieldName === 'name' && value) {
        if (value.length < 2) {
            errorMessage = 'Le nom doit contenir au moins 2 caractères.';
            isValid = false;
        } else if (value.length > 50) {
            errorMessage = 'Le nom ne peut pas dépasser 50 caractères.';
            isValid = false;
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
            errorMessage = 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets.';
            isValid = false;
        }
    }
    // Subject validation
    else if (fieldName === 'subject' && value) {
        if (value.length > 100) {
            errorMessage = 'Le sujet ne peut pas dépasser 100 caractères.';
            isValid = false;
        }
    }
    // Message validation
    else if (fieldName === 'message' && value) {
        if (value.length < 10) {
            errorMessage = 'Le message doit contenir au moins 10 caractères.';
            isValid = false;
        } else if (value.length > 1000) {
            errorMessage = 'Le message ne peut pas dépasser 1000 caractères.';
            isValid = false;
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
        field.setAttribute('aria-invalid', 'true');
    } else {
        field.setAttribute('aria-invalid', 'false');
        if (value) { // Only show success if field has content
            showFieldSuccess(field);
        }
    }
    
    return isValid;
}

function handleFieldInput(e) {
    const field = e.target;
    
    // Clear error on input (but don't validate yet)
    if (field.classList.contains('error')) {
        clearFieldError(field);
    }
    
    // Update character counter for message field
    if (field.name === 'message') {
        updateCharacterCounter(field);
    }
    
    // Show typing indicator for better UX
    field.classList.add('typing');
    clearTimeout(field.typingTimeout);
    field.typingTimeout = setTimeout(() => {
        field.classList.remove('typing');
    }, 500);
}

function handleFieldFocus(e) {
    const field = e.target;
    field.parentNode.classList.add('focused');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    field.classList.remove('success', 'typing');
    field.classList.add('error');
    
    const formGroup = field.parentNode;
    formGroup.classList.add('has-error');
    formGroup.classList.remove('has-success');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message with animation
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<span class="error-icon">⚠️</span> ${message}`;
    formGroup.appendChild(errorDiv);
    
    // Animate in
    requestAnimationFrame(() => {
        errorDiv.classList.add('show');
    });
}

function showFieldSuccess(field) {
    field.classList.remove('error', 'typing');
    field.classList.add('success');
    
    const formGroup = field.parentNode;
    formGroup.classList.remove('has-error');
    formGroup.classList.add('has-success');
}

function clearFieldError(field) {
    field.classList.remove('error', 'success');
    field.removeAttribute('aria-invalid');
    
    const formGroup = field.parentNode;
    formGroup.classList.remove('has-error', 'has-success', 'focused');
    
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.classList.add('hide');
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.remove();
            }
        }, 300);
    }
}

function clearAllFieldErrors(form) {
    const fields = form.querySelectorAll('input, textarea');
    fields.forEach(field => {
        clearFieldError(field);
    });
}

function addCharacterCounter(field) {
    const formGroup = field.parentNode;
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    formGroup.appendChild(counter);
    updateCharacterCounter(field);
}

function updateCharacterCounter(field) {
    const counter = field.parentNode.querySelector('.character-counter');
    if (counter) {
        const current = field.value.length;
        const max = 1000;
        const remaining = max - current;
        
        counter.textContent = `${current}/${max}`;
        
        counter.classList.remove('warning', 'error');
        
        if (remaining < 50) {
            counter.classList.add('warning');
        }
        
        if (remaining < 0) {
            counter.classList.add('error');
        }
    }
}

function setSubmitButtonState(button, state) {
    const buttonText = button.querySelector('span');
    const originalText = buttonText.dataset.originalText || buttonText.textContent;
    
    // Store original text if not already stored
    if (!buttonText.dataset.originalText) {
        buttonText.dataset.originalText = buttonText.textContent;
    }
    
    button.disabled = state !== 'default';
    button.classList.remove('loading', 'success', 'error');
    
    switch (state) {
        case 'loading':
            buttonText.textContent = 'Envoi en cours...';
            button.classList.add('loading');
            break;
        case 'success':
            buttonText.textContent = '✓ Envoyé';
            button.classList.add('success');
            setTimeout(() => {
                setSubmitButtonState(button, 'default');
            }, 3000);
            break;
        case 'error':
            buttonText.textContent = 'Erreur - Réessayer';
            button.classList.add('error');
            setTimeout(() => {
                setSubmitButtonState(button, 'default');
            }, 5000);
            break;
        default:
            buttonText.textContent = originalText;
            break;
    }
}

function showMessage(message, type = 'info') {
    clearFormMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            ${message}
            <button class="message-close" aria-label="Fermer">&times;</button>
        </div>
    `;
    
    const form = document.querySelector('#contact-form');
    form.appendChild(messageDiv);
    
    // Animate in
    requestAnimationFrame(() => {
        messageDiv.classList.add('show');
    });
    
    // Close button functionality
    const closeButton = messageDiv.querySelector('.message-close');
    closeButton.addEventListener('click', () => {
        clearFormMessage();
    });
    
    // Auto remove after timeout
    const timeout = type === 'success' ? 8000 : 12000;
    setTimeout(() => {
        clearFormMessage();
    }, timeout);
}

function clearFormMessage() {
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.classList.add('hide');
        setTimeout(() => {
            if (existingMessage.parentNode) {
                existingMessage.remove();
            }
        }, 300);
    }
}

async function simulateFormSubmission(formData) {
    // Simulate API call with realistic delay
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Basic spam detection
            const message = formData.get('message')?.toLowerCase() || '';
            const name = formData.get('name')?.toLowerCase() || '';
            
            const spamKeywords = ['click here', 'buy now', 'free money', 'urgent', 'winner', 'congratulations'];
            const hasSpam = spamKeywords.some(keyword => 
                message.includes(keyword) || name.includes(keyword)
            );
            
            if (hasSpam) {
                reject(new Error('Message détecté comme potentiel spam'));
                return;
            }
            
            // Check for suspicious patterns
            if (message.length < 10 || name.length < 2) {
                reject(new Error('Données insuffisantes'));
                return;
            }
            
            // Simulate 95% success rate
            if (Math.random() > 0.05) {
                resolve({ 
                    success: true, 
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toISOString()
                });
            } else {
                reject(new Error('Erreur serveur temporaire'));
            }
        }, Math.random() * 2000 + 1000); // 1-3 seconds delay
    });
}

// Production implementation examples (commented out)
/*
async function submitToNetlifyFunction(formData) {
    const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData))
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Network error');
    }
    
    return response.json();
}

async function submitToFormspree(formData) {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Form submission failed');
    }
    
    return response.json();
}
*/

// Export functions for testing
export { validateForm, showMessage, clearFormMessage, isValidEmail };