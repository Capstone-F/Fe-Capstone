import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  className?: string;
  showLabel?: boolean;
  asLink?: boolean;
};

export function BrandMark({
  href = "/",
  className = "",
  showLabel = true,
  asLink = true,
}: BrandMarkProps) {
  const content = (
    <>
      <Image
        src="/icon.png"
        alt="GlowScan logo"
        width={38}
        height={42}
        priority
        className="h-10 w-auto shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
      />
      {showLabel ? (
        <span className="font-serif text-xl font-bold tracking-tight text-[#2C3E35]">
          Glow
          <span className="font-sans font-light text-[#5C7468]">Scan</span>
        </span>
      ) : null}
    </>
  );

  if (!asLink) {
    return (
      <div
        className={`group inline-flex items-center gap-2.5 select-none ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {content}
    </Link>
  );
}
