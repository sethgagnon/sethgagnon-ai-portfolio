

## Plan: Lock Down Auth Page

Remove the signup option from the Auth page since your account already exists.

### Changes to `src/pages/Auth.tsx`

1. Remove the `isSignUp` state and all signup-related logic
2. Remove the signup branch in `handleSubmit` — keep only `signInWithPassword`
3. Remove the "Need an account? Sign up" toggle button
4. Title stays as "Admin Login"

This is a small, single-file change.

