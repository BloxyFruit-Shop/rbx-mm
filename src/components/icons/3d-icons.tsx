import Image from "next/image";
import { cn } from '~/lib/utils';

export const FireIcon = ({className} : {className? : string}) => (
  <div className={cn("flex size-32 items-center justify-center rounded-lg", className)}>
    <Image
      src="/images/fire-icon.webp"
      alt="Fire Icon"
      width={200}
      height={200}
    />
  </div>
);

export const PeopleIcon = ({className} : {className? : string}) => (
  <div className={cn("flex size-32 items-center justify-center rounded-lg", className)}>
    <Image
      src="/images/people-icon.webp"
      alt="People Icon"
      width={200}
      height={200}
    />
  </div>
);

export const HandshakeIcon = ({className} : {className? : string}) => (
  <div className={cn("flex size-32 items-center justify-center rounded-lg -mb-2", className)}>
    <Image
      src="/images/handshake-icon.png"
      alt="Handshake Icon"
      width={200}
      height={200}
    />
  </div>
);
