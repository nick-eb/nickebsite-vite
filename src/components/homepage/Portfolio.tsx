import './Portfolio.css';

const portfolioItems = [
  {
    title: 'FunkiniOS',
    img: 'funkiniOS.png',
    href: '/funkin',
    description: 'Port of Friday Night Funkin to iOS'
  },
  {
    title: 'iPhone Repair',
    img: 'iphones.png',
    href: '/iphonerepair',
    description: 'Professional iPhone repair services'
  },
  {
    title: 'Modded GBC',
    img: 'moddedgb.png',
    href: '/gbc',
    description: 'Custom modded Game Boy Color'
  }
];

const Portfolio = () => {
  return (
    <section className="portfolio-section">
      <div className="content-container">
        <h2 className="section-title">My Work</h2>
        <p className="text-center text-gray-300 mb-8">
          A selection of my range of work
        </p>
        
        <div className="portfolio-grid">
          {portfolioItems.map((item, i) => (
            <a
              key={item.title}
              href={item.href}
              className="portfolio-item"
            >
              <div>
                <img
                  src={`/src/assets/img/${item.img}`}
                  alt={item.title}
                  className="portfolio-image"
                />
                <div className="portfolio-overlay">
                  <h3 className="portfolio-title">{item.title}</h3>
                  <p className="portfolio-description">{item.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;