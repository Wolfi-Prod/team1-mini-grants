export const MOCK_AUTH_COOKIE = "mock-role";

/**
 * Dev toggle: when this cookie is set to "1", the mock auth layer pretends the current
 * user never finished onboarding — `onboardingCompletedAt` is nulled at read-time. Used
 * to demo the onboarding gate without editing mock data. Default "0" = profile complete.
 */
export const MOCK_PROFILE_INCOMPLETE_COOKIE = "mock-profile-incomplete";
