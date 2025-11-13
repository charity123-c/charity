// API Configuration - Use relative paths since frontend and backend are now unified
const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeNavigation();
    initializeSuggestionForm();
    initializeFAQ();
    loadRecentSuggestions();
    updateHeroStats();
}

function initializeNavigation() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            const isVisible = navLinks.style.display === 'flex';
            navLinks.style.display = isVisible ? 'none' : 'flex';
        });
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        });
    });
}

function initializeSuggestionForm() {
    const form = document.getElementById('suggestionForm');
    const textarea = document.getElementById('suggestion');
    const charCount = document.getElementById('charCount');
    
    if (form) {
        form.addEventListener('submit', handleSuggestionSubmit);
    }
    
    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            if (count > 450) {
                charCount.style.color = '#ff0000';
            } else if (count > 350) {
                charCount.style.color = '#ff9900';
            } else {
                charCount.style.color = '#666666';
            }
        });
    }
}

async function handleSuggestionSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    const formData = new FormData(e.target);
    const suggestion = {
        department: formData.get('department'),
        suggestion_text: formData.get('suggestion'),
        tag: formData.get('tag')
    };

    if (!suggestion.department || !suggestion.suggestion_text || !suggestion.tag) {
        alert('Please fill in all fields');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }

    if (suggestion.suggestion_text.length < 10) {
        alert('Please provide a more detailed suggestion (minimum 10 characters)');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }

    if (suggestion.suggestion_text.length > 500) {
        alert('Suggestion must be less than 500 characters');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/suggestions/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(suggestion)
        });

        if (response.ok) {
            alert('Thank you! Your suggestion has been submitted successfully. The administration will review it soon.');
            e.target.reset();
            document.getElementById('charCount').textContent = '0';
            loadRecentSuggestions();
            updateHeroStats();
        } else {
            alert('Error submitting suggestion. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please check your connection and try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function initializeFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

async function loadSuggestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/suggestions`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to load suggestions from API');
            return [];
        }
    } catch (error) {
        console.error('Error loading suggestions:', error);
        return [];
    }
}

async function loadRecentSuggestions() {
    const suggestions = await loadSuggestions();
    displayRecentSuggestions(suggestions.slice(0, 6));
}

function displayRecentSuggestions(suggestions) {
    const container = document.getElementById('suggestionsPreview');
    if (!container) return;

    if (suggestions.length === 0) {
        container.innerHTML = `
            <div class="no-suggestions" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666; font-style: italic;">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                <h3>No Suggestions Yet</h3>
                <p>Be the first to share your ideas and help improve Muni University!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-card">
            <div class="suggestion-header">
                <span class="suggestion-department">
                    <i class="fas fa-building"></i>
                    ${suggestion.department}
                </span>
                <span class="suggestion-category">${suggestion.tag}</span>
            </div>
            <div class="suggestion-text">
                ${suggestion.suggestion_text}
            </div>
            <div class="suggestion-footer">
                <span class="suggestion-date">
                    <i class="far fa-clock"></i>
                    ${new Date(suggestion.timestamp).toLocaleDateString()}
                </span>
                <span class="suggestion-status status-${suggestion.status.toLowerCase().replace(' ', '')}">
                    ${suggestion.status}
                </span>
            </div>
        </div>
    `).join('');
}

async function updateHeroStats() {
    const suggestions = await loadSuggestions();
    const total = suggestions.length;
    const resolved = suggestions.filter(s => s.status === 'Resolved').length;
    
    document.getElementById('totalSuggestionsCount').textContent = total;
    document.getElementById('resolvedCount').textContent = resolved;
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

