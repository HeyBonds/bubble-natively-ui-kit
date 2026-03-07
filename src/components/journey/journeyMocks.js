/**
 * Journey mock helpers — video URLs and data mappers.
 *
 * Reuses Bubble CDN URLs from insightMocks.js (already trusted Natively hosts).
 */

// Single mock video for all lessons (Doctor Leo)
const LEARN_VIDEO = 'https://0fc323560b9c4d8afc3a7d487716abb6.cdn.bubble.io/f1772915224789x322666761931095900/Doctor_Leo_Finding_the_Pause_V9_%28short%29_with_captions.mp4';

/**
 * Returns a video URL for the learn step.
 * Accepts chapter for future per-chapter videos; returns single mock URL for now.
 */
export function getLearnVideoUrl(_chapter) {
  return LEARN_VIDEO;
}
