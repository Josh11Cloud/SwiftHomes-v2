import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import correo from '../../assets/images/correo.png'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("message", formData.message);

      try {
        await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLg3hB8okVV5HPjH-6LyNxSve1tu3HSmWfqbc1YXHFLuCzsv5bEFSjmwpJ_NlKabTBTGifvzw_gndU7UaUcLk26fsGMm9R-tw4lCpv89uNgyAVmXDerviedXp1h17gQBeINmQGDIJVFOSRsBpo6fDo60jYIQDUjG-VRqgRC90ugQbz3S-NW92X1N-H70svFhWSjiVgPcajhqW48tU7U4NgUxW4yUnk4X6hP8IFfJcce_XcJMGA_BkIMkJ0HnyaMU8tOQizke-zhCNUZVV6IkooIppsaPUpX3Um22Kubc&lib=MHvilX95sblhMXEkQkg5WOAaK-5ggeP_m', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        toast.success('¡Mensaje enviado con éxito!');
        setFormData({ name: '', email: '', message: '' });
      } catch (error) {
        toast.error('Hubo un error al enviar tu mensaje');
      } finally {
        setIsSubmitting(false);
      }
    };

return(
  <>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
      <div className='text-center mt-6 md:mt-0'>
      <motion.h1
      initial={{ opacity: 0, y:-20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration: 0.8 }}
      className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">
        Estamos aquí para <span className="text-gray-900">Ayudarte</span></motion.h1>
        <motion.p 
        initial={{ opacity: 0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 1 }}
        className="text-base md:text-lg text-slate-800">¿Tienes dudas, quieres asesoría o una propuesta personalizada? Escríbenos y te responderemos en menos de 24 horas.</motion.p>
        </div>
         <motion.img 
         src={correo} 
         alt="Correo"
        initial={{ opacity: 0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 0.8 }} 
         className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"/>
      </section> 
    <div className="bg-white py-12 px-4 md:px-12" id="contact">
    <Toaster />
    <h2 className="text-3xl font-bold text-center text-[#0077B6] mb-4">Contáctanos</h2>  
       <div className="space-y-2 text-sm text-gray-700 mb-4">
        <div className="flex items-center justify-center gap-2">
          <Phone className="text-[#0077B6]" size={20} />
          <span>+52 33 2788 2862</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Mail className="text-[#0077B6]" size={20} />
          <span>swiftHomesContacto@gmail.com</span>
        </div>
      </div>

    {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-slate-100 p-6 rounded-2xl shadow space-y-4">
          <input
            type="text"
            placeholder="Tu nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-[#0077B6]"
          />
          <input
            type="email"
            placeholder="Tu correo"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-[#0077B6]"
          />
          <textarea
            placeholder="Escribe tu mensaje..."
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-[#0077B6]"
          ></textarea>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${isSubmitting ? 'bg-gray-400': 'bg-[#0077b6] hover:bg-[#005f87]'}`}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
    </div>
  </>
  );
}