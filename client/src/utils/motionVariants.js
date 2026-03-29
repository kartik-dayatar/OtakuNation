/**
 * Reusable Framer Motion Variants
 * Animation rules: hover 150–200ms | entrance 400–500ms | stagger 80ms | max 700ms
 * All animations use transform + opacity only where possible.
 */

const EASE_SMOOTH = [0.4, 0, 0.2, 1];
const EASE_DECEL = [0, 0, 0.2, 1];

// ===== PAGE TRANSITIONS (350–450ms) =====
export const routeTransition = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, ease: EASE_SMOOTH },
    },
    exit: {
        opacity: 0,
        y: -12,
        transition: { duration: 0.3, ease: EASE_SMOOTH },
    },
};

// ===== ENTRANCE ANIMATIONS (400–500ms) =====
export const fadeInUp = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE_SMOOTH },
    },
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: EASE_SMOOTH },
    },
};

export const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: EASE_SMOOTH },
    },
};

export const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: EASE_SMOOTH },
    },
};

export const fadeInScale = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.45, ease: EASE_SMOOTH },
    },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 400, damping: 20, mass: 0.8 },
    },
};

// Hero card entrance — fade + slight upward (500ms)
export const heroCardEntrance = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: EASE_SMOOTH },
    },
};

// Section reveal with stagger
export const sectionReveal = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE_SMOOTH },
    },
};

// ===== STAGGER CONTAINERS (80ms delay) =====
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

export const staggerContainerSlow = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.15,
        },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: EASE_SMOOTH },
    },
};

// ===== HOVER & TAP (150–200ms) =====
export const hoverScale = {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 400, damping: 17 },
};

export const hoverScaleSubtle = {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 20 },
};

export const hoverLift = {
    y: -4,
    transition: { type: 'spring', stiffness: 400, damping: 17 },
};

export const hoverGlow = {
    boxShadow: '0 0 20px rgba(79, 70, 229, 0.2)',
    transition: { duration: 0.18 },
};

export const tapScale = {
    scale: 0.96,
    transition: { type: 'spring', stiffness: 500, damping: 20 },
};

export const tapScaleSubtle = {
    scale: 0.98,
    transition: { type: 'spring', stiffness: 500, damping: 20 },
};

// ===== CARD ANIMATIONS =====
// Light theme card hover — soft shadow + subtle scale
export const cardHover = {
    y: -6,
    scale: 1.03,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(79, 70, 229, 0.08)',
    transition: { type: 'spring', stiffness: 300, damping: 20 },
};

export const imageHoverZoom = {
    scale: 1.06,
    transition: { duration: 0.5, ease: EASE_SMOOTH },
};

// ===== SLIDE ANIMATIONS =====
export const slideInRight = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'spring', damping: 30, stiffness: 350, mass: 0.8 },
};

export const slideInUp = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { type: 'spring', damping: 28, stiffness: 300 },
};

// Sidebar — slide in from left (300ms)
export const sidebarSlide = {
    hidden: { x: -260, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: EASE_SMOOTH },
    },
    exit: {
        x: -260,
        opacity: 0,
        transition: { duration: 0.25, ease: EASE_SMOOTH },
    },
};

// ===== OVERLAY =====
export const overlayFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ===== TOAST =====
export const toastVariant = {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 500, damping: 25, mass: 0.6 },
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: { duration: 0.2, ease: 'easeIn' },
    },
};

// ===== BADGE =====
export const badgePop = {
    initial: { scale: 0, rotate: -45 },
    animate: {
        scale: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 600, damping: 15 },
    },
    exit: {
        scale: 0,
        rotate: 45,
        transition: { duration: 0.15 },
    },
};

// Glow pulse for limited edition badges
export const badgeGlowPulse = {
    boxShadow: [
        '0 0 0px rgba(79, 70, 229, 0)',
        '0 0 12px rgba(79, 70, 229, 0.25)',
        '0 0 0px rgba(79, 70, 229, 0)',
    ],
    transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

// ===== FLOATING =====
export const floatAnimation = {
    y: [0, -8, 0],
    transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

export const floatAnimationSlow = {
    y: [0, -12, 0],
    transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

// ===== PULSE =====
export const pulseGlow = {
    boxShadow: [
        '0 0 0px rgba(79, 70, 229, 0)',
        '0 0 16px rgba(79, 70, 229, 0.3)',
        '0 0 0px rgba(79, 70, 229, 0)',
    ],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

// ===== COUNTDOWN FLIP =====
export const countdownFlip = {
    initial: { opacity: 0, y: -12, scale: 0.8 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 500, damping: 20 },
    },
    exit: {
        opacity: 0,
        y: 12,
        scale: 0.8,
        transition: { duration: 0.15 },
    },
};

// ===== UTILITY: Spring presets =====
export const springs = {
    snappy: { type: 'spring', stiffness: 500, damping: 25 },
    gentle: { type: 'spring', stiffness: 300, damping: 20 },
    bouncy: { type: 'spring', stiffness: 400, damping: 15 },
    stiff: { type: 'spring', stiffness: 600, damping: 30 },
};

// ===== UTILITY: Custom easing =====
export const easings = {
    smooth: EASE_SMOOTH,
    decel: EASE_DECEL,
    snappy: [0.55, 0, 0.1, 1],
    accel: [0.4, 0, 1, 1],
};
