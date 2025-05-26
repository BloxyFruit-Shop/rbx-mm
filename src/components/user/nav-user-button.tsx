import Link from 'next/link';
import { Button } from '~/components/ui/button';
import UserMenu from './user-menu';

interface NavUserButtonProps {
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
  };
}
function NavUserButton({user} : NavUserButtonProps) {

  if (!user?.name) {
    return (
      <Button variant="ghost" size="user" asChild>
        <Link href="/login" className="flex items-center gap-2">
          Login
        </Link>
      </Button>
    )
  }

  const constrainedUser = {
    name: user.name,
    email: user.email,
    image: user.image
  }

  return (
    <UserMenu user={constrainedUser} />
  )
}

export default NavUserButton;