import { Lightbulb, Timer, Stars } from 'lucide-react';

const benefits = [
    {
        icon: <Lightbulb className='w-8 h-8 text-[#0077b6]' />,
        title: "Automatización Inteligente",
        description: "Recibe recomendaciones personalizadas basadas en tus preferencias. SwiftHomes se adapta a ti."
    },
    {
        icon: <Timer className='w-8 h-8 text-[#0077b6]' />,
        title: "Ahorra Tiempo y Esfuerzo",
        description: "Encuentra la propiedad perfecta sin navegar cientos de listados irrelevantes."
    },
    {
        icon: <Stars className='w-8 h-8 text-[#0077b6]' />,
        title: "Experiencia Moderna",
        description: "Interfaz limpia, rápida y pensada para ofrecerte lo mejor del mercado inmobiliario actual."
    }
];

export default function WhySwiftHomes() {
    return (
        <section className='bg-slate-100 py-16 px-4 sm:px-8'>
            <div className='max-w-6xl mx-auto text-center'>
                <h2 className='text-3xl font-bold text-gray-800 mb-10'>¿Por qué SwiftHomes?</h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    {benefits.map((item, index) => (
                        <div key={index} className='bg-gray-50 p-6 rounded-2xl shadow hover:shadow-md transition'>
                            <div className='mb-4'>{item.icon}</div>
                            <h3 className='text-xl font-semibold mb-2'>{item.title}</h3>
                            <p className='text-gray-600 text-sm'>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>  
        </section>
    );
}