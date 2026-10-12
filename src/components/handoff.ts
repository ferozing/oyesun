"use client";

// The app is served at /app on this same origin, so handing a signed-in
// session across is a sessionStorage write and a navigation. No token in a URL
// — where it would sit in browser history and in every log along the way — and
// no server side handoff table to build and expire. sessionStorage is scoped
// to this origin and this tab, and the app deletes the key the moment it
// reads it.
export const HANDOFF_KEY = "oyesun_handoff";

export function enterApp(customToken: string) {
  try {
    sessionStorage.setItem(HANDOFF_KEY, customToken);
  } catch {
    // Storage blocked: private mode, or site data turned off. The account
    // exists either way, so send them through and let the app's own login
    // screen pick it up.
  }
  // A real page load, not router.push: /app is not a Next.js page, it is the
  // app itself proxied in from Cloud Run. A client-side navigation would go
  // looking for an RSC payload that was never there.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = "/app";
}
