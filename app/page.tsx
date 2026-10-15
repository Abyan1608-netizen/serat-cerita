import CustomOrder from "@/components/home/CustomOrder";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import Hero from "@/components/home/Hero";
import Story from "@/components/home/Story";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <CustomOrder />
      <Story />
    </>
  );
}
