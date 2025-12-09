import { Appbar } from "@/component/Appbar";
import { Hero } from "@/component/Hero";
import { HeroVideo } from "@/component/HeroVideo";

export default function Home() {
  return (
    
      <main className="pb-48">
        <Appbar />
        <Hero />
        <div className="pt-8">
        <HeroVideo/>
        </div>
      </main>
   
  );
}
