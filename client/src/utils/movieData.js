export const INITIAL_MOVIES = [
  {
    _id: 'm1',
    title: 'Kalki 2898 AD',
    description: 'A futuristic mythological saga set in 2898 AD where the world is on the brink of extinction. The legendary warrior Ashwatthama awakens to protect Sumathi and her unborn child who is prophesied to bring balance to the cosmos.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genre: ['Action', 'Sci-Fi', 'Fantasy'],
    language: ['Telugu', 'Hindi', 'Tamil'],
    duration: 181,
    rating: 8.4,
    votes: 145000,
    releaseDate: '2024-06-27',
    director: 'Nag Ashwin',
    cast: [
      { name: 'Prabhas', character: 'Bhairava' },
      { name: 'Deepika Padukone', character: 'Sumathi' },
      { name: 'Amitabh Bachchan', character: 'Ashwatthama' },
      { name: 'Kamal Haasan', character: 'Supreme Yaskin' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/FVF5wOcw5QI',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX'],
    isActive: true
  },
  {
    _id: 'm2',
    title: 'Pushpa 2: The Rule',
    description: 'The continuation of the saga of Pushpa Raj, who rises to rule the red sandalwood empire. When authorities and rival syndicates attempt to crush his dominance, Pushpa unleashes an unprecedented cinematic rebellion.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop',
    genre: ['Action', 'Crime', 'Drama'],
    language: ['Telugu', 'Hindi', 'Tamil'],
    duration: 190,
    rating: 8.7,
    votes: 215000,
    releaseDate: '2024-12-05',
    director: 'Sukumar',
    cast: [
      { name: 'Allu Arjun', character: 'Pushpa Raj' },
      { name: 'Rashmika Mandanna', character: 'Srivalli' },
      { name: 'Fahadh Faasil', character: 'Bhanwar Singh Shekhawat' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/o9IXTkBvFHw',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX', '4DX'],
    isActive: true
  },
  {
    _id: 'm3',
    title: 'Stree 2',
    description: 'The town of Chanderi faces a new, terrifying supernatural menace known as Sarkata. Vicky and his loyal companions must join forces with the mysterious Stree to save the women of their village.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop',
    genre: ['Horror', 'Comedy'],
    language: ['Hindi'],
    duration: 160,
    rating: 8.1,
    votes: 190000,
    releaseDate: '2024-08-15',
    director: 'Amar Kaushik',
    cast: [
      { name: 'Rajkummar Rao', character: 'Vicky' },
      { name: 'Shraddha Kapoor', character: 'Stree' },
      { name: 'Pankaj Tripathi', character: 'Rudra' },
      { name: 'Aparshakti Khurana', character: 'Bittu' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/A_LXFGTb8TI',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D'],
    isActive: true
  },
  {
    _id: 'm4',
    title: 'Devara: Part 1',
    description: 'A heroic coastal warrior stands fearless against treachery and smuggling along the treacherous sea shores, passing on his fierce code of honor to the next generation.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=1600&auto=format&fit=crop',
    genre: ['Action', 'Drama', 'Thriller'],
    language: ['Telugu', 'Hindi', 'Tamil'],
    duration: 176,
    rating: 7.5,
    votes: 82000,
    releaseDate: '2024-09-27',
    director: 'Koratala Siva',
    cast: [
      { name: 'Jr. NTR', character: 'Devara' },
      { name: 'Janhvi Kapoor', character: 'Thangam' },
      { name: 'Saif Ali Khan', character: 'Bhaira' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/0XChSqZ3lzE',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX'],
    isActive: true
  },
  {
    _id: 'm5',
    title: 'Singham Again',
    description: 'DCP Bajirao Singham wages an all-out war against international terror networks. The iconic cop universe unites with Simmba, Sooryavanshi, and Shakti Shetty for the ultimate showdown.',
    poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
    genre: ['Action', 'Crime'],
    language: ['Hindi'],
    duration: 168,
    rating: 7.2,
    votes: 68000,
    releaseDate: '2024-11-01',
    director: 'Rohit Shetty',
    cast: [
      { name: 'Ajay Devgn', character: 'Singham' },
      { name: 'Kareena Kapoor', character: 'Avni' },
      { name: 'Ranveer Singh', character: 'Simmba' },
      { name: 'Deepika Padukone', character: 'Lady Singham' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/5L3eu0cHNZo',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D'],
    isActive: true
  },
  {
    _id: 'm6',
    title: 'The Buckingham Murders',
    description: 'An Indian detective investigates the mysterious disappearance and murder of a young boy in a secluded British town while wrestling with her own personal demons.',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genre: ['Crime', 'Mystery', 'Thriller'],
    language: ['Hindi', 'English'],
    duration: 115,
    rating: 7.6,
    votes: 34000,
    releaseDate: '2024-09-13',
    director: 'Hansal Mehta',
    cast: [
      { name: 'Kareena Kapoor', character: 'Jasmeet Bhamra' },
      { name: 'Ranveer Brar', character: 'DC Churchill' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/0WZfhFP2g0A',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D'],
    isActive: true
  },
  {
    _id: 'm7',
    title: 'Lucky Bhaskar',
    description: 'An ordinary middle-class bank cashier uncovers a hidden loophole in the financial system and rises into extraordinary wealth, triggering a high-stakes investigation.',
    poster: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    genre: ['Crime', 'Drama', 'Thriller'],
    language: ['Telugu', 'Hindi'],
    duration: 157,
    rating: 8.2,
    votes: 59000,
    releaseDate: '2024-09-05',
    director: 'Venky Atluri',
    cast: [
      { name: 'Dulquer Salmaan', character: 'Bhaskar' },
      { name: 'Meenakshi Chaudhary', character: 'Malli' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/7eFWfTNFe7c',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D'],
    isActive: true
  },
  {
    _id: 'm8',
    title: 'Azaad',
    description: 'An epic period saga following the fearless connection between a rebel horse named Azaad and an unwavering young rider battling for independence.',
    poster: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop',
    genre: ['Adventure', 'Drama', 'Action'],
    language: ['Hindi'],
    duration: 148,
    rating: 7.4,
    votes: 24000,
    releaseDate: '2025-01-17',
    director: 'Abhishek Kapoor',
    cast: [
      { name: 'Aaman Devgan', character: 'Azaad' },
      { name: 'Rasha Thadani', character: 'Nandini' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/0j7-YbDOWXg',
    status: 'coming_soon',
    certificate: 'U',
    format: ['2D'],
    isActive: true
  },
  {
    _id: 'm9',
    title: 'Sky Force',
    description: 'The untold true story of India\'s first and deadliest retaliatory airstrike, captured through heart-stopping aerial combat and the unyielding valor of its fighter pilots.',
    poster: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f1?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
    genre: ['Action', 'War', 'Drama'],
    language: ['Hindi'],
    duration: 155,
    rating: 8.0,
    votes: 38000,
    releaseDate: '2025-01-24',
    director: 'Abhishek Anil Kapur',
    cast: [
      { name: 'Akshay Kumar', character: 'Rakesh' },
      { name: 'Sara Ali Khan', character: 'Sanjana' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/bE3_UKlkMwE',
    status: 'coming_soon',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX'],
    isActive: true
  },
  {
    _id: 'm10',
    title: 'Game Changer',
    description: 'A righteous Indian civil servant challenges corrupt political machines through groundbreaking electoral strategies to restore democracy to the people.',
    poster: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop',
    genre: ['Action', 'Drama'],
    language: ['Telugu', 'Hindi'],
    duration: 172,
    rating: 7.5,
    votes: 46000,
    releaseDate: '2025-01-10',
    director: 'Shankar',
    cast: [
      { name: 'Ram Charan', character: 'Ram Nandan' },
      { name: 'Kiara Advani', character: 'Deepika' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/mJBkBwF7C_E',
    status: 'coming_soon',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX', '4DX'],
    isActive: true
  }
];

export const INITIAL_THEATRES = [
  {
    _id: 't1',
    name: 'PVR ICON - Phoenix Palladium',
    city: 'Mumbai',
    address: 'Lower Parel, Phoenix Mills Compound, Senapati Bapat Marg, Mumbai',
    facilities: ['Dolby Atmos', 'IMAX Laser', 'Recliners', 'Gourmet Food', 'Valet Parking'],
    totalScreens: 11
  },
  {
    _id: 't2',
    name: 'INOX Megaplex - Inorbit Mall',
    city: 'Mumbai',
    address: 'Inorbit Mall, Link Road, Malad West, Mumbai',
    facilities: ['IMAX', '4DX', 'ScreenX', 'Kiddles', 'Club Lounge'],
    totalScreens: 11
  },
  {
    _id: 't3',
    name: 'PVR Director\'s Cut - Ambience Mall',
    city: 'Delhi',
    address: 'Ambience Mall, Vasant Kunj, Nelson Mandela Marg, New Delhi',
    facilities: ['Dolby Atmos', 'Ultra Luxury Recliners', 'Chef Crafted Dining', 'VIP Lounge'],
    totalScreens: 8
  },
  {
    _id: 't4',
    name: 'PVR Superplex - Forum Mall',
    city: 'Bangalore',
    address: 'The Forum Mall, 21 Hosur Road, Koramangala, Bengaluru',
    facilities: ['IMAX', '4DX', 'Dolby Atmos', 'Cafe Unwind'],
    totalScreens: 11
  },
  {
    _id: 't5',
    name: 'AMB Cinemas Superplex',
    city: 'Hyderabad',
    address: 'AMB Mall, Financial District, Gachibowli, Hyderabad',
    facilities: ['Dolby Atmos', 'IMAX Laser', 'M-Lounge', 'Laser Projection'],
    totalScreens: 10
  }
];

export const INITIAL_OFFERS = [
  {
    _id: 'o1',
    title: 'Opening Day Special - 30% OFF',
    description: 'Get 30% discount on all movie tickets. Valid for first-time bookings on IMovies!',
    couponCode: 'IMOVIES30',
    discountType: 'percentage',
    discountValue: 30,
    maxDiscount: 200,
    minOrderAmount: 300,
    expiryDate: '2025-12-31'
  },
  {
    _id: 'o2',
    title: 'Weekend Bonanza - Flat ₹100 OFF',
    description: 'Flat ₹100 off on weekend bookings. Sit back, relax, and enjoy the show!',
    couponCode: 'WEEKEND100',
    discountType: 'flat',
    discountValue: 100,
    minOrderAmount: 400,
    expiryDate: '2025-12-31'
  },
  {
    _id: 'o3',
    title: 'Student Special - 25% OFF',
    description: 'Students get 25% off on all cinema screenings. Maximum savings for youth!',
    couponCode: 'STUDENT25',
    discountType: 'percentage',
    discountValue: 25,
    maxDiscount: 125,
    minOrderAmount: 200,
    expiryDate: '2025-12-31'
  }
];

export const generateSeatGrid = () => {
  const seats = [];
  const rows = [
    { row: 'A', category: 'Platinum', price: 400, count: 10 },
    { row: 'B', category: 'Platinum', price: 400, count: 10 },
    { row: 'C', category: 'Gold', price: 250, count: 10 },
    { row: 'D', category: 'Gold', price: 250, count: 10 },
    { row: 'E', category: 'Gold', price: 250, count: 10 },
    { row: 'F', category: 'Gold', price: 250, count: 10 },
    { row: 'G', category: 'Silver', price: 150, count: 10 },
    { row: 'H', category: 'Silver', price: 150, count: 10 },
    { row: 'I', category: 'Silver', price: 150, count: 10 },
    { row: 'J', category: 'Silver', price: 150, count: 10 },
  ];

  rows.forEach(({ row, category, price, count }) => {
    for (let i = 1; i <= count; i++) {
      const isBooked = (row === 'D' && (i === 4 || i === 5)) ||
                       (row === 'E' && (i === 6 || i === 7)) ||
                       (row === 'B' && (i === 3 || i === 8));
      seats.push({
        seatNumber: `${row}${i}`,
        row,
        category,
        price,
        isBooked,
        isBlocked: false
      });
    }
  });

  return seats;
};
