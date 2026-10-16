import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
export default function Page(){return <main className="auth-page"><Link href="/" className="brand">LearnWith<span>Sally</span></Link><SignUp forceRedirectUrl="/app" signInUrl="/sign-in"/></main>;}
