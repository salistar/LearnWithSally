import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
export default function Page(){return <main className="auth-page"><Link href="/" className="brand">LearnWith<span>Sally</span></Link><SignIn forceRedirectUrl="/app" signUpUrl="/sign-up"/></main>;}
