import Link from 'next/link';
import WhySwiftHomes from '../../components/WhySwiftHomes';
import { motion } from 'framer-motion';

function Home() {
  return (
      <>
      <header className="bg-white shadow-md">
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
      <div className='text-center mt-6 md:mt-0'>
      <motion.h1
      initial={{ opacity: 0, y:-20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration: 0.8 }}
      className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">
        Bienvenido a <span className="text-gray-900">SwiftHomes</span></motion.h1>
        <motion.p 
        initial={{ opacity: 0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 1 }}
        className="text-base md:text-lg text-slate-800">Tu plataforma inteligente para comprar o rentar propiedades</motion.p>
        </div>
         <motion.img 
         src="/assets/images/hero-png.png" 
         alt="Hero"
        initial={{ opacity: 0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 0.8 }} 
         className="w-full sm:w-full md:w-1/2 h-auto max-h-64 object-contain"/>
      </section> 
        </header>
      <WhySwiftHomes />
        <section 
          className='text-center py-60 w-full' 
          style={{
            backgroundImage: `url(/assets/images/bg-1.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
      <div className='flex justify-center gap-4 flex-wrap bg-black-50'></div>
          <motion.div 
          className="relative z-10 text-center text-slate-50"
          initial={{opacity: 0, y:30}}
          animate={{opacity: 1, y:0}}
          transition={{duration: 0.8}}>
          
    <h2 className="text-4xl font-bold mb-6 py-4 text-slate-50">
      Empieza a descubrir propiedades
    </h2>
    <div className="flex justify-center gap-4 mt-10 flex-wrap">
      <Link href="/comprar" legacyBehavior>
        <a className="bg-slate-50 text-black shadow-md rounded-xl px-6 h-10 flex items-center justify-center text-lg font-medium hover:bg-[#0077b6] transition">
          Comprar
        </a>
      </Link>
      <Link href="/rentar" legacyBehavior>
        <a className="bg-slate-50 text-black shadow-md rounded-xl px-6 h-10 flex items-center justify-center text-lg font-medium hover:bg-[#0077b6] transition">
          Rentar
        </a>
      </Link>
      <Link href="/inversiones" legacyBehavior>
        <a className="bg-slate-50 text-black shadow-md rounded-xl px-6 h-10 flex items-center justify-center text-lg font-medium hover:bg-[#0077b6] transition">
          Inversiones
        </a>
      </Link>
      </div>
      </motion.div>
    </section>
    </>
  );
}

export default Home;
