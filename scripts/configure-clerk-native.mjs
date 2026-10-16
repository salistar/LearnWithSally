import { createClerkClient } from '@clerk/backend';
const url = 'learnwithsally://sso-callback';
try {
  if (!process.env.CLERK_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Development instance required');
  const clerk = createClerkClient({secretKey:process.env.CLERK_SECRET_KEY});
  const existing = await clerk.redirectUrls.getRedirectUrlList();
  if (!existing.data.some(item => item.url === url)) {
    await clerk.redirectUrls.createRedirectUrl({url});
  }
  console.log('PASS native SSO callback configured for LearnWithSally development instance');
} catch(error) {
  console.error(`FAIL native SSO configuration: ${error?.status ?? error?.name ?? 'unknown'}`);
  process.exitCode=1;
}
