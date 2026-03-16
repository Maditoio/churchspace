import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewListingWizard } from "@/components/forms/listing/NewListingWizard";

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/listings/new");
  }

  return <NewListingWizard />;
}
