function RegistrationMark() {
  return <span className="swiss-registration" aria-hidden="true" />
}

export function SwissFooterBar() {
  return (
    <footer className="border-t border-foreground/30">
      <div className="mx-auto grid h-10 max-w-[96rem] grid-cols-[1fr_auto_1fr] items-center px-4 font-mono text-[0.625rem] font-bold text-red-600 sm:px-8">
        <p>Made by MAKERs</p>
        <RegistrationMark />
        <p className="text-right">Sponsered by RainYun</p>
      </div>
    </footer>
  )
}
