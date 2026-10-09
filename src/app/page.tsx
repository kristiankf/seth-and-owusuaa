import { InvitationCover } from "@/components/invitation/InvitationCover";
import { CoupleHero } from "@/components/sections/CoupleHero";
import { WelcomeSection } from "@/components/sections/WelcomeSection";
import { OrderOfService } from "@/components/sections/OrderOfService";
import { OrderOfPhotography } from "@/components/sections/OrderOfPhotography";
import { VenueSection } from "@/components/sections/VenueSection";
import { PhotoGallery } from "@/components/sections/PhotoGallery";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />

      <InvitationCover>
        <main>
          <CoupleHero />
          <WelcomeSection />
          <OrderOfService />
          <OrderOfPhotography />
          <VenueSection />
          <PhotoGallery />
        </main>

        <ClosingSection />
      </InvitationCover>
    </>
  );
}
