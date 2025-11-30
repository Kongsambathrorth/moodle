// Global state variables (functions will rely on DOM elements found later)
let currentStep = 1; 
const totalSteps = 5;

// --- DOM ELEMENTS (Declared as variables, assigned inside DOMContentLoaded) ---
let sidebar, contentWrapper, fixedControls;

// --- EXPOSE FUNCTIONS GLOBALLY (Crucial for inline onclick in index.html) ---
// Note: These functions must NOT rely on the DOM elements being initialized yet!
window.toggleSidebar = toggleSidebar;
window.toggleReadingMode = toggleReadingMode;
window.flipCard = flipCard;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.toggleLesson = toggleLesson;
window.checkMultipleChoice = checkMultipleChoice;
window.checkFillInTheBlank = checkFillInTheBlank;


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Assign DOM elements here to ensure they exist when accessed
    sidebar = document.getElementById('sidebar');
    contentWrapper = document.getElementById('content-wrapper');
    fixedControls = document.getElementById('fixed-controls');

    // 2. Initialize desktop/mobile layout state
    if (window.innerWidth >= 768) {
        // Desktop: Ensure sidebar starts open by default 
        sidebar.classList.remove('hidden-sidebar');
        contentWrapper.classList.remove('full-width');
        fixedControls.classList.remove('full-width');
    } else {
        // Mobile: Ensure sidebar starts hidden
        sidebar.classList.remove('active-mobile');
    }

    // 3. Initialize Module 2 Process Block
    updateProcessDisplay();

    // 4. Initialize Module 6 Accordion state
    const lesson61 = document.getElementById('lesson-6-1');
    if (lesson61) {
        const header61 = lesson61.previousElementSibling;
        if (lesson61.classList.contains('active')) {
            header61.querySelector('.accordion-icon').innerHTML = '×';
            header61.classList.add('active');
        } else {
            header61.querySelector('.accordion-icon').innerHTML = '+';
            header61.classList.remove('active');
        }
    }
    
    // 5. Initialize Active Navigation state based on current scroll position
    updateActiveNav();

    // 6. Attach listeners for fill-in-the-blank checks after DOM is ready
    document.getElementById('kc1_q2_input')?.nextElementSibling?.addEventListener('click', () => {
        checkFillInTheBlank('kc1_q2', ['split-screen', 'splitscreen']);
    });
    document.getElementById('kc3_q3_input')?.nextElementSibling?.addEventListener('click', () => {
        checkFillInTheBlank('kc3_q3', ['Lesson']);
    });
    document.getElementById('kc6_q2_input')?.nextElementSibling?.addEventListener('click', () => {
        checkFillInTheBlank('kc6_q2', ['weeding', 'weed']);
    });
    
    // 7. Attach listeners to knowledge check buttons
    document.querySelectorAll('.knowledge-check-activity').forEach(activity => {
        activity.querySelectorAll('button').forEach(button => {
            const item = button.closest('.knowledge-check-item');
            const radioName = item.querySelector('input[type="radio"]') ? item.querySelector('input[type="radio"]').name : null;

            if (radioName) {
                // Attach listener only for radio buttons (fill-in-the-blank is handled above)
                button.addEventListener('click', () => {
                    switch (radioName) {
                        case 'kc1_q1': checkMultipleChoice('kc1_q1', 'b'); break;
                        case 'kc1_q3': checkMultipleChoice('kc1_q3', 'false'); break;
                        case 'kc2_q1': checkMultipleChoice('kc2_q1', 'b'); break;
                        case 'kc2_q2': checkMultipleChoice('kc2_q2', 'c'); break; 
                        case 'kc3_q1': checkMultipleChoice('kc3_q1', 'c'); break;
                        case 'kc3_q2': checkMultipleChoice('kc3_q2', 'false'); break;
                        case 'kc4_q1': checkMultipleChoice('kc4_q1', 'false'); break;
                        case 'kc4_q2': checkMultipleChoice('kc4_q2', 'c'); break;
                        case 'kc5_q1': checkMultipleChoice('kc5_q1', 'b'); break;
                        case 'kc5_q2': checkMultipleChoice('kc5_q2', 'false'); break;
                        case 'kc6_q1': checkMultipleChoice('kc6_q1', 'c'); break;
                        case 'kc7_q1': checkMultipleChoice('kc7_q1', 'false'); break;
                        case 'kc7_q2': checkMultipleChoice('kc7_q2', 'b'); break;
                        case 'kc8_q1': checkMultipleChoice('kc8_q1', 'b'); break;
                        case 'kc8_q2': checkMultipleChoice('kc8_q2', 'false'); break;
                        default: break;
                    }
                });
            }
        });
    });
});

// Optional: Re-initialize desktop/mobile view classes on resize
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        // When resizing to desktop: if it's currently in the mobile active state, close it to desktop state.
        if (sidebar.classList.contains('active-mobile')) {
             sidebar.classList.remove('active-mobile');
        }
        // If hidden-sidebar is present, content should be full-width (re-apply persistence)
        if (sidebar.classList.contains('hidden-sidebar')) {
            contentWrapper.classList.add('full-width');
            fixedControls.classList.add('full-width');
        } else {
            contentWrapper.classList.remove('full-width');
            fixedControls.classList.remove('full-width');
        }
    } else {
        // When resizing to mobile: clear desktop state if present
        sidebar.classList.remove('hidden-sidebar');
        contentWrapper.classList.remove('full-width');
        fixedControls.classList.remove('full-width');
        // Ensure mobile state is hidden by default unless manually opened
    }
});


// --- NAVIGATION & LAYOUT LOGIC ---

/** Toggles the visibility of the navigation sidebar */
function toggleSidebar() {
    // Check if elements are initialized before trying to access properties
    if (!sidebar || !contentWrapper || !fixedControls) {
        console.error("DOM elements for sidebar or content not found.");
        return;
    }

    if (window.innerWidth >= 768) {
        // DESKTOP LOGIC: Toggle the hidden-sidebar class and adjust content margin
        const isHidden = sidebar.classList.toggle('hidden-sidebar');
        contentWrapper.classList.toggle('full-width', isHidden);
        fixedControls.classList.toggle('full-width', isHidden);
    } else {
        // MOBILE LOGIC: Toggle the active-mobile overlay class
        sidebar.classList.toggle('active-mobile');
    }
}

/** Updates the active link in the sidebar based on scroll position */
function updateActiveNav() {
    // Since this is attached to window.scroll, we check for element existence
    if (!sidebar) return; 
    
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        // Use 100px offset to trigger the current state slightly before the section reaches the very top
        if (scrollY >= section.offsetTop - 100) { 
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        // Remove previous active classes
        link.classList.remove('current-module', 'accent-indigo', 'accent-cyan', 'accent-green', 'accent-red');
        link.classList.remove('bg-gray-300');
        link.classList.add('bg-gray-200');

        if (link.getAttribute('href').includes(current)) {
            const accent = link.getAttribute('data-accent');
            link.classList.add('current-module', accent, 'bg-gray-300');
            link.classList.remove('bg-gray-200');
        }
    });
}
window.addEventListener('scroll', updateActiveNav);


// --- MODULE 2: PROCESS BLOCK LOGIC ---

function updateProcessDisplay() {
    // Check if element exists before calling querySelectorAll
    if (!document.getElementById('process-steps')) return; 
    
    document.querySelectorAll('.process-step').forEach(step => {
        step.classList.remove('active');
    });
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    // Safety checks for process controls
    const stepCounter = document.getElementById('step-counter');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (stepCounter) stepCounter.textContent = `${currentStep} of ${totalSteps}`;
    if (prevBtn) prevBtn.disabled = currentStep === 1;
    if (nextBtn) nextBtn.disabled = currentStep === totalSteps;
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        updateProcessDisplay();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateProcessDisplay();
    }
}


// --- MODULE 3: FLASHCARD LOGIC ---

/** Toggles the 'flipped' class on the card for click-to-flip action */
function flipCard(cardElement) {
    cardElement.classList.toggle('flipped');
}


// --- MODULE 6: ACCORDION LOGIC ---

/** Toggles the visibility of an accordion content area */
function toggleLesson(id) {
    const content = document.getElementById(id);
    if (!content) return;

    const header = content.previousElementSibling;
    const icon = header.querySelector('.accordion-icon');

    if (content.classList.contains('active')) {
        // Collapse
        content.classList.remove('active');
        header.classList.remove('active');
        icon.innerHTML = '+';
    } else {
        // Expand
        content.classList.add('active');
        header.classList.add('active');
        icon.innerHTML = '×';
    }
}


// --- MODULE 7: READING MODE LOGIC ---

/** Toggles the high-contrast reading mode for accessibility */
function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
    const button = document.getElementById('toggle-reading-mode-btn');
    if (!button) return;

    if (document.body.classList.contains('reading-mode')) {
        button.classList.replace('bg-gray-600', 'bg-yellow-600');
        button.title = 'Disable Reading Mode';
    } else {
        button.classList.replace('bg-yellow-600', 'bg-gray-600');
        button.title = 'Enable Reading Mode';
    }
}


// --- KNOWLEDGE CHECK LOGIC (Module 1 - 8) ---

/** Generic function for checking multiple choice questions */
function checkMultipleChoice(questionId, correctValue) {
    const container = document.querySelector(`.feedback-${questionId}`).closest('.knowledge-check-item');
    if (!container) return;

    const selected = container.querySelector(`input[name="${questionId}"]:checked`);
    const feedbackElement = container.querySelector(`.feedback-${questionId}`);

    feedbackElement.classList.remove('hidden');
    
    if (selected && selected.value === correctValue) {
        feedbackElement.innerHTML = '<span class="text-green-600">Correct! Well done.</span>';
        feedbackElement.classList.replace('text-red-600', 'text-green-600');
    } else {
        feedbackElement.innerHTML = `<span class="text-red-600">Incorrect. Review the module content and try again.</span>`;
        feedbackElement.classList.replace('text-green-600', 'text-red-600');
    }
}

/** Generic function for checking fill-in-the-blank questions */
function checkFillInTheBlank(questionId, correctAnswers) {
    const inputElement = document.getElementById(`${questionId}_input`);
    const feedbackElement = document.querySelector(`.feedback-${questionId}`);
    if (!inputElement || !feedbackElement) return;

    const userAnswer = inputElement.value.trim().toLowerCase();
    
    // Check if the user answer contains any of the correct answers
    const isCorrect = correctAnswers.some(answer => userAnswer.includes(answer.toLowerCase()));

    feedbackElement.classList.remove('hidden');

    if (isCorrect) {
        feedbackElement.innerHTML = '<span class="text-green-600">Correct! That is a key term.</span>';
        feedbackElement.classList.replace('text-red-600', 'text-green-600');
    } else {
        feedbackElement.innerHTML = '<span class="text-red-600">Incorrect. Review the content and try again.</span>';
        feedbackElement.classList.replace('text-green-600', 'text-red-600');
    }
}