import { PropsWithChildren, ReactNode } from 'react';

type PageLayoutProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PageLayout({ title, subtitle, actions, children }: PropsWithChildren<PageLayoutProps>) {
  return (
    <section className="min-h-[calc(100vh-6rem)] bg-[#F7F7F5] dark:bg-gradient-to-b dark:from-[#0C3C4A] dark:to-[#124F62]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-26 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-teal-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>
        {children}
      </div>
    </section>
  );
}