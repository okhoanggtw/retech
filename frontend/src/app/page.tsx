import Hero from "@/components/home/Hero";
import { Banners, Categories, Featured, Pledges, Promotions, TradeInTeaser } from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Banners />
      <Categories />
      <Featured />
      <TradeInTeaser />
      <Promotions />
      <Pledges />
    </>
  );
}
