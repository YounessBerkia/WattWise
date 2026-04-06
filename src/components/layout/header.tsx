import Image from 'next/image';

import Logo from '../../../assets/Logo.png';

/**
 * Header component with logo
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel panel-glow flex h-[72px] w-full items-center justify-between rounded-[28px] !bg-white/28 px-5 backdrop-blur-3xl sm:px-6 dark:!bg-black/18">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/72 shadow-sm dark:bg-white/10">
            <Image src={Logo} alt="WattWise Logo" className="h-8 w-8 object-contain" priority />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium tracking-[0.18em] uppercase">
              Energy Control
            </p>
            <h1 className="text-text text-lg font-semibold sm:text-xl">WattWise</h1>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-text-secondary rounded-full border border-white/45 bg-white/38 px-3 py-1.5 text-sm shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/6">
            Dashboard
          </div>
        </div>
      </div>
    </header>
  );
}
