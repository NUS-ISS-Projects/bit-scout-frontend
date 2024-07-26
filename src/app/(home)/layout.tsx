import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default async function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col justify-between'>
      <header className='container z-40 bg-background'>
        <div className='flex h-20 py-6'>
          <Header />
        </div>
      </header>
      <main className='flex-1 flex items-center justify-center'>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
