// Modal functionality
function openJobApplication(jobTitle, jobId) {
    const modal = document.getElementById('jobModal');
    const modalTitle = document.getElementById('modalJobTitle');
    const jobPosition = document.getElementById('jobPosition');
    const jobIdInput = document.getElementById('jobId');

    modalTitle.textContent = `Apply for ${jobTitle}`;
    jobPosition.value = jobTitle;
    jobIdInput.value = jobId;

    modal.style.display = 'block';

    // Completely disable Lenis
    if (window.lenis) {
        window.lenis.destroy();
        window.lenis = null;
    }

    // Stop all scroll events on body
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    // Force modal to be scrollable
    const modalContent = document.querySelector('.modal-content');
    modalContent.style.overflowY = 'scroll';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.position = 'relative';

    // Remove any existing event listeners that might interfere
    document.removeEventListener('wheel', window.lenisRaf);

    setTimeout(() => {
        modalContent.focus();
    }, 100);
}

// Handle scroll events within modal
function handleModalScroll(e) {
    const modalContent = document.querySelector('.modal-content');
    const scrollTop = modalContent.scrollTop;
    const scrollHeight = modalContent.scrollHeight;
    const clientHeight = modalContent.clientHeight;

    // Allow scrolling within modal bounds
    if (e.deltaY < 0 && scrollTop === 0) {
        // Scrolling up at top - prevent default
        e.preventDefault();
    } else if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
        // Scrolling down at bottom - prevent default
        e.preventDefault();
    }
    // Otherwise, let the modal scroll naturally
}

function closeJobApplication() {
    const modal = document.getElementById('jobModal');
    modal.style.display = 'none';

    // Properly restore body styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    // Re-enable Lenis smooth scrolling when modal is closed
    // Always reinitialize Lenis since it was destroyed when modal opened
    window.lenis = new Lenis({
        duration: 0.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 2
    });

    // Restart the RAF loop for Lenis
    function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Remove body scroll prevention
    document.body.removeEventListener('wheel', preventBodyScroll);
    document.body.removeEventListener('touchmove', preventBodyScroll);

    // Remove event listeners
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.removeEventListener('wheel', handleModalScroll);
        modalContent.removeEventListener('touchmove', handleModalScroll);
    }

    // Reset form
    const form = document.querySelector('.job-application-form');
    if (form) {
        form.reset();
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('jobModal');
    if (event.target === modal) {
        closeJobApplication();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeJobApplication();
    }
});

// Prevent body scroll when modal is open
function preventBodyScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

async function handleJobApplication(event) {
    event.preventDefault();

    const form = event.target;
    const file = form.cv.files[0];
    const submitBtn = form.querySelector('.submit-btn');

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;

    try {
        // Create unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload file directly to the bucket root
        const { error: fileError } = await supabaseClient
            .storage
            .from('cvs')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (fileError) throw fileError;

        // Get the file URL
        const { data } = await supabaseClient
            .storage
            .from('cvs')
            .getPublicUrl(fileName);

        // Submit the application data
        const { error } = await supabaseClient
            .from('job_applications')
            .insert([{
                full_name: form.full_name.value,
                email: form.email.value,
                phone: form.phone.value,
                position: form.position.value,
                job_id: form.job_id.value,
                cover_letter: form.cover_letter.value,
                cv_url: data.publicUrl,
                applied_at: new Date().toISOString()
            }]);

        if (error) throw error;

        // Show success popup instead of alert
        showSuccessPopup();
        form.reset();
        closeJobApplication();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit application. Please try again.');
    } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Success Popup Functions
function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.style.display = 'block';

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Auto close after 5 seconds
    setTimeout(() => {
        closeSuccessPopup();
    }, 5000);
}

function closeSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.style.display = 'none';

    // Re-enable body scroll
    document.body.style.overflow = '';

    // Re-initialize Lenis if it doesn't exist
    if (!window.lenis) {
        window.lenis = new Lenis({
            duration: 0.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            touchMultiplier: 2
        });

        // Restart the RAF loop for Lenis
        function raf(time) {
            window.lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
}

// Close success popup when clicking outside
window.addEventListener('click', function(event) {
    const popup = document.getElementById('successPopup');
    if (event.target === popup) {
        closeSuccessPopup();
    }
});

// Close success popup with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const popup = document.getElementById('successPopup');
        if (popup.style.display === 'block') {
            closeSuccessPopup();
        }
    }
});