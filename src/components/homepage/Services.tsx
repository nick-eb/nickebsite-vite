import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faWrench } from '@fortawesome/free-solid-svg-icons';
import './Services.css';

const services = [
  {
    title: 'Software Development',
    description: 'Custom software solutions and web applications',
    icon: faCode,
    gradient: 'from-blue-600 to-cyan-400'
  },
  {
    title: 'Hardware Repair',
    description: 'iPhone, game console, and electronics repair',
    icon: faWrench,
    gradient: 'from-purple-600 to-pink-500'
  }
];

const Services = () => {
  return (
    <section className="my-services relative py-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-900/10 to-black"></div>
      
      <div className="content-container relative z-10">
        <h2 className="text-5xl md:text-6xl font-bold text-center text-white mb-16">
          <span className="title-accent">What I do</span>
        </h2>

        <div className="services-grid">
          {services.map((service, i) => (
            <div 
              key={service.title}
              className="service-card"
            >
              <div className="service-content">
                <div className="service-icon">
                  <FontAwesomeIcon 
                    icon={service.icon} 
                    className="text-3xl" 
                  />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">
                  {service.title}
                </h3>
                <p className="text-lg text-gray-300/90">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;