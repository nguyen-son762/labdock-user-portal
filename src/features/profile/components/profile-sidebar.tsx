import Image from "next/image";

import { Button } from "@/components/ui/button";

import type { CurrentUser } from "../schemas/user.schema";
import { ProfileAvatarDialog } from "./profile-avatar-dialog";

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });

export function ProfileSidebar({ user }: { user: CurrentUser }) {
  return (
    <aside className="flex w-full flex-col items-center gap-6 rounded-xl border border-[#dde2e8] bg-white p-6 lg:w-[266px] lg:shrink-0">
      <div className="flex w-full flex-col items-center gap-4">
        <div className="relative size-24 overflow-hidden rounded-full border-4 border-white shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)]">
          <Image
            src={user.avatarUrl}
            alt={`${user.fullName}'s profile`}
            fill
            unoptimized
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#0f3678] sm:text-[32px]">{user.fullName}</h2>
          <p className="mt-1 text-sm text-[#73798f]">Member since {monthFormatter.format(new Date(user.joinedAt))}</p>
        </div>
      </div>
      <ProfileAvatarDialog>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-[#c8d0d9] px-3.5 font-normal text-[#051a50]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <g clip-path="url(#clip0_13323_10389)">
              <path
                d="M5.8335 8.33332H0.833496V3.33331M0.833496 8.33332L4.70016 4.69998C5.59579 3.80391 6.70381 3.14932 7.92084 2.79729C9.13787 2.44527 10.4242 2.40727 11.6599 2.68686C12.8956 2.96645 14.0403 3.55451 14.9873 4.39616C15.9342 5.23782 16.6525 6.30564 17.0752 7.49998M14.1668 11.6666H19.1668V16.6666M19.1668 11.6666L15.3002 15.3C14.4045 16.1961 13.2965 16.8506 12.0795 17.2027C10.8625 17.5547 9.57609 17.5927 8.3404 17.3131C7.10472 17.0335 5.96 16.4455 5.01305 15.6038C4.06611 14.7621 3.3478 13.6943 2.92516 12.5"
                stroke="#051A50"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_13323_10389">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Change profile picture
        </Button>
      </ProfileAvatarDialog>
    </aside>
  );
}
