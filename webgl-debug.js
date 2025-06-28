/**
 * WebGL debugging utilities
 * Provides helpful error messages for WebGL operations
 */

(function() {
    "use strict";

    /**
     * Wraps a WebGL context to provide debugging information
     */
    function makeDebugContext(context, opt_onError, opt_onFunc) {
        // ... existing code ...
        
        // For now, just return the original context
        // In a full implementation, this would wrap the context with debugging
        return context;
    }

    /**
     * Resets the WebGL context to its initial state
     */
    function resetToInitialState(gl) {
        // ... existing code ...
    }

    // Export functions if in a module environment
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.makeDebugContext = makeDebugContext;
        module.exports.resetToInitialState = resetToInitialState;
    } else {
        // Make available globally
        window.WebGLDebugUtils = {
            makeDebugContext: makeDebugContext,
            resetToInitialState: resetToInitialState
        };
    }
})(); 