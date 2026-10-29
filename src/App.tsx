import Demo from './components/Demo';
import Footer from './components/Footer';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Mcp from './components/Mcp';
import Nav from './components/Nav';
import Report from './components/Report';
import Shelf from './components/Shelf';
import { useAnalysis } from './hooks/useAnalysis';
import { useHealth } from './hooks/useHealth';

export default function App() {
  const analysis = useAnalysis();
  const health = useHealth();

  return (
    <>
      <Nav />
      <main id="contenido">
        <Hero onExample={analysis.loadExample} />
        <Demo analysis={analysis} health={health} />
        <Report state={analysis.state} />
        <HowItWorks />
        <Shelf />
        <Mcp />
      </main>
      <Footer />
    </>
  );
}
