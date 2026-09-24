import * as React from "react";

export function GirihPattern({ className = "" }: React.SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 80 80" fill="none"><defs><pattern id="girih-star" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 4 23.5 14.5 34 12 28 21 35 28 24 27 20 36 16 27 5 28 12 21 6 12 16.5 14.5 20 4Z" stroke="currentColor" strokeWidth="1" /><path d="m20 0 0 40M0 20h40" stroke="currentColor" strokeWidth=".5" opacity=".45" /></pattern></defs><rect width="80" height="80" fill="url(#girih-star)" /></svg>;
}
