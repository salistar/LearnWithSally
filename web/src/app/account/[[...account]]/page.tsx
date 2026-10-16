import { UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
export default function Page(){return <main className="auth-page"><Link href="/app" className="brand">LearnWith<span>Sally</span></Link><UserProfile path="/account" routing="path"/></main>;}
