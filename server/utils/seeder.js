require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Showtime = require('../models/Showtime');
const Offer = require('../models/Offer');
const Booking = require('../models/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

const generateSeats = (platinumRows = 2, goldRows = 4, silverRows = 4, seatsPerRow = 10) => {
  const seats = [];
  let rowIndex = 0;

  for (let i = 0; i < platinumRows; i++) {
    const row = String.fromCharCode(65 + rowIndex++);
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({ seatNumber: `${row}${j}`, row, category: 'Platinum', isBooked: false, isBlocked: false });
    }
  }
  for (let i = 0; i < goldRows; i++) {
    const row = String.fromCharCode(65 + rowIndex++);
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({ seatNumber: `${row}${j}`, row, category: 'Gold', isBooked: false, isBlocked: false });
    }
  }
  for (let i = 0; i < silverRows; i++) {
    const row = String.fromCharCode(65 + rowIndex++);
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({ seatNumber: `${row}${j}`, row, category: 'Silver', isBooked: false, isBlocked: false });
    }
  }
  return seats;
};

const moviesData = [
  {
    title: 'Kalki 2898 AD',
    description: 'A futuristic mythological saga set in 2898 AD where the world is on the brink of extinction. Kali, the most powerful king on Earth, needs to capture Suma, a pregnant woman whose unborn child is the next avatar of Vishnu. The last savior stands between hope and apocalypse.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/8/80/Kalki_2898_AD_poster.jpg',
    backdrop: 'https://m.media-amazon.com/images/M/MV5BYWI1NzMzNjQtZjFiNi00NGZhLTllNzctNTYyN2QyMGE3ZjA2XkEyXkFqcGdeQXVyMTU1MDM3NDk0._V1_.jpg',
    genre: ['Action', 'Sci-Fi', 'Fantasy'],
    language: ['Telugu', 'Hindi', 'Tamil', 'Malayalam'],
    duration: 181,
    rating: 8.3,
    votes: 125400,
    releaseDate: new Date('2024-06-27'),
    director: 'Nag Ashwin',
    cast: [
      { name: 'Prabhas', character: 'Bhairava', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Prabhas_at_the_trailer_launch_of_Saaho.jpg/440px-Prabhas_at_the_trailer_launch_of_Saaho.jpg' },
      { name: 'Deepika Padukone', character: 'Sumathi', photo: '' },
      { name: 'Amitabh Bachchan', character: 'Ashwatthama', photo: '' },
      { name: 'Kamal Haasan', character: 'Supreme Yaskin', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/FVF5wOcw5QI',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX'],
    isActive: true
  },
  {
    title: 'Pushpa 2: The Rule',
    description: 'The continuation of the saga of Pushpa Raj, who rises to become a red sandalwood smuggling king. His empire is threatened by his old rival Shekhawat, but Pushpa refuses to bow down to anyone.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/3/34/Pushpa2TheRule.jpg',
    backdrop: 'https://m.media-amazon.com/images/M/MV5BM2QzNjIzODktNGM5Mi00YWNhLWE3ZGEtNWE5MjhiZTlkOGUwXkEyXkFqcGdeQXVyMTU1MDM3NDk0._V1_.jpg',
    genre: ['Action', 'Crime', 'Drama'],
    language: ['Telugu', 'Hindi', 'Tamil'],
    duration: 190,
    rating: 8.6,
    votes: 210000,
    releaseDate: new Date('2024-12-05'),
    director: 'Sukumar',
    cast: [
      { name: 'Allu Arjun', character: 'Pushpa Raj', photo: '' },
      { name: 'Rashmika Mandanna', character: 'Srivalli', photo: '' },
      { name: 'Fahadh Faasil', character: 'Bhanwar Singh Shekhawat', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/o9IXTkBvFHw',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX', '4DX'],
    isActive: true
  },
  {
    title: 'Stree 2',
    description: 'The demon Stree is back to haunt the town of Chanderi once more. But this time, something bigger looms over the horizon. Vicky and his friends must unite with unlikely allies to protect their town from the ancient evil.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/a/aa/Stree_2_poster.jpg',
    backdrop: 'https://m.media-amazon.com/images/M/MV5BZjNhZmQwNzItODRiNi00MjBiLTlhZTItMTdmMGEzMGFhNGJmXkEyXkFqcGdeQXVyMTU1MDM3NDk0._V1_.jpg',
    genre: ['Horror', 'Comedy'],
    language: ['Hindi'],
    duration: 160,
    rating: 8.0,
    votes: 185000,
    releaseDate: new Date('2024-08-15'),
    director: 'Amar Kaushik',
    cast: [
      { name: 'Rajkummar Rao', character: 'Vicky', photo: '' },
      { name: 'Shraddha Kapoor', character: 'Stree', photo: '' },
      { name: 'Pankaj Tripathi', character: 'Rudra', photo: '' },
      { name: 'Aparshakti Khurana', character: 'Bittu', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/A_LXFGTb8TI',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D'],
    isActive: true
  },
  {
    title: 'Devara: Part 1',
    description: 'A fearsome and revered man of the sea spreads terror for reasons unknown. Decades later, his legacy challenges the bloodthirsty villains of the coast.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Devara_Part_1_poster.jpg',
    backdrop: '',
    genre: ['Action', 'Drama', 'Thriller'],
    language: ['Telugu', 'Hindi', 'Tamil'],
    duration: 176,
    rating: 7.2,
    votes: 75000,
    releaseDate: new Date('2024-09-27'),
    director: 'Koratala Siva',
    cast: [
      { name: 'Jr. NTR', character: 'Devara / Vara', photo: '' },
      { name: 'Janhvi Kapoor', character: 'Thangam', photo: '' },
      { name: 'Saif Ali Khan', character: 'Bhaira', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/0XChSqZ3lzE',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX'],
    isActive: true
  },
  {
    title: 'Singham Again',
    description: 'ACP Bajirao Singham returns with a mission to save his family and battle the forces of evil. This time, the stakes are higher as an entire police universe unites against the greatest villain yet.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/3/3d/Singham_Again_poster.jpg',
    backdrop: '',
    genre: ['Action', 'Crime'],
    language: ['Hindi'],
    duration: 168,
    rating: 7.0,
    votes: 62000,
    releaseDate: new Date('2024-11-01'),
    director: 'Rohit Shetty',
    cast: [
      { name: 'Ajay Devgn', character: 'ACP Bajirao Singham', photo: '' },
      { name: 'Kareena Kapoor', character: 'Avni Singham', photo: '' },
      { name: 'Ranveer Singh', character: 'Simmba', photo: '' },
      { name: 'Tiger Shroff', character: 'Satya', photo: '' },
      { name: 'Deepika Padukone', character: 'Lady Singham', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/5L3eu0cHNZo',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D'],
    isActive: true
  },
  {
    title: 'The Buckingham Murders',
    description: 'An Indian detective investigates the brutal murder of a boy in a small English town, while dealing with the devastating loss of her own child. A gripping crime thriller that unravels dark secrets.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/5/5c/The_Buckingham_Murders.jpg',
    backdrop: '',
    genre: ['Crime', 'Drama', 'Mystery', 'Thriller'],
    language: ['Hindi', 'English'],
    duration: 115,
    rating: 7.5,
    votes: 32000,
    releaseDate: new Date('2024-09-13'),
    director: 'Hansal Mehta',
    cast: [
      { name: 'Kareena Kapoor', character: 'Jasmeet Bhamra', photo: '' },
      { name: 'Ranveer Brar', character: 'DC Churchill', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/0WZfhFP2g0A',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D'],
    isActive: true
  },
  {
    title: 'Vicky Vidya Ka Woh Wala Video',
    description: 'A hilarious comedy set in the 90s era of cassettes and VHS tapes. A couple\'s intimate video goes missing, sending them on a frantic chase through their small town, encountering bizarre characters and even more bizarre situations.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/1/11/Vicky_Vidya_Ka_Woh_Wala_Video.jpg',
    backdrop: '',
    genre: ['Comedy', 'Romance'],
    language: ['Hindi'],
    duration: 144,
    rating: 6.9,
    votes: 28000,
    releaseDate: new Date('2024-10-11'),
    director: 'Raaj Shaandilyaa',
    cast: [
      { name: 'Rajkummar Rao', character: 'Vicky', photo: '' },
      { name: 'Triptii Dimri', character: 'Vidya', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/dAVqJcC4k9E',
    status: 'now_showing',
    certificate: 'A',
    format: ['2D'],
    isActive: true
  },
  {
    title: 'Lucky Bhaskar',
    description: 'A down-on-his-luck bank employee discovers a clever scheme that could turn his fortunes around, but gets entangled in a web of crime, deception, and greed that spirals out of control.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Lucky_Bhaskar_poster.jpg',
    backdrop: '',
    genre: ['Crime', 'Drama', 'Thriller'],
    language: ['Telugu', 'Hindi'],
    duration: 157,
    rating: 8.1,
    votes: 55000,
    releaseDate: new Date('2024-09-05'),
    director: 'Venky Atluri',
    cast: [
      { name: 'Dulquer Salmaan', character: 'Lucky Bhaskar', photo: '' },
      { name: 'Meenakshi Chaudhary', character: 'Malli', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/7eFWfTNFe7c',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D'],
    isActive: true
  },
  {
    title: 'UI',
    description: 'A political thriller that exposes the dark underbelly of democracy. When a charismatic leader rises to power through manipulation and fear, a group of unlikely heroes must band together to expose the truth.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/5/58/UI_Kannada_film_poster.jpg',
    backdrop: '',
    genre: ['Action', 'Thriller', 'Drama'],
    language: ['Kannada', 'Hindi', 'Tamil', 'Telugu'],
    duration: 170,
    rating: 7.8,
    votes: 48000,
    releaseDate: new Date('2024-11-21'),
    director: 'Upendra',
    cast: [
      { name: 'Upendra', character: 'UI', photo: '' },
      { name: 'Reema Sen', character: 'Angel', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/7YTN7cZJGeE',
    status: 'now_showing',
    certificate: 'UA',
    format: ['2D', '3D'],
    isActive: true
  },
  {
    title: 'Azaad',
    description: 'An epic period adventure following the bond between a rebel horse named Azaad and a spirited young woman. Set against the backdrop of colonial India, it\'s a story of freedom, friendship, and revolution.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Azaad_2025_film_poster.jpg/330px-Azaad_2025_film_poster.jpg',
    backdrop: '',
    genre: ['Adventure', 'Drama', 'Action'],
    language: ['Hindi'],
    duration: 148,
    rating: 7.3,
    votes: 22000,
    releaseDate: new Date('2025-01-17'),
    director: 'Abhishek Kapoor',
    cast: [
      { name: 'Aaman Devgan', character: 'Azaad', photo: '' },
      { name: 'Rasha Thadani', character: 'Nandini', photo: '' },
      { name: 'Ajay Devgn', character: 'Govind', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/0j7-YbDOWXg',
    status: 'coming_soon',
    certificate: 'U',
    format: ['2D'],
    isActive: true
  },
  {
    title: 'Sky Force',
    description: 'Based on true events, this film chronicles India\'s first airstrike mission. A gripping war drama about courage, sacrifice, and the unbreakable spirit of the Indian Air Force.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Sky_Force_film_poster.jpg/330px-Sky_Force_film_poster.jpg',
    backdrop: '',
    genre: ['Action', 'War', 'Drama'],
    language: ['Hindi'],
    duration: 155,
    rating: 7.9,
    votes: 35000,
    releaseDate: new Date('2025-01-24'),
    director: 'Abhishek Anil Kapur',
    cast: [
      { name: 'Akshay Kumar', character: 'Rakesh', photo: '' },
      { name: 'Veer Pahariya', character: 'T.K.', photo: '' },
      { name: 'Sara Ali Khan', character: 'Sanjana', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/bE3_UKlkMwE',
    status: 'coming_soon',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX'],
    isActive: true
  },
  {
    title: 'Game Changer',
    description: 'An honest IAS officer takes on a corrupt political system through a series of daring electoral battles, risking everything to bring justice and change to a broken system.',
    poster: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Game_Changer_%282025_film%29_poster.jpg/330px-Game_Changer_%282025_film%29_poster.jpg',
    backdrop: '',
    genre: ['Action', 'Drama'],
    language: ['Telugu', 'Hindi', 'Tamil'],
    duration: 172,
    rating: 6.8,
    votes: 42000,
    releaseDate: new Date('2025-01-10'),
    director: 'Shankar',
    cast: [
      { name: 'Ram Charan', character: 'Ram Nandan / Appanna', photo: '' },
      { name: 'Kiara Advani', character: 'Deepika', photo: '' },
      { name: 'Anjali', character: 'Sarika', photo: '' }
    ],
    trailerUrl: 'https://www.youtube.com/embed/mJBkBwF7C_E',
    status: 'coming_soon',
    certificate: 'UA',
    format: ['2D', '3D', 'IMAX', '4DX'],
    isActive: true
  }
];

const theatresData = [
  {
    name: 'PVR Cinemas - Phoenix Mall',
    city: 'Mumbai',
    address: 'Lower Parel, Phoenix Mills Compound, Senapati Bapat Marg, Mumbai - 400013',
    pincode: '400013',
    phone: '18600208181',
    email: 'pvr.phoenix@pvrcinemas.com',
    facilities: ['Parking', 'Food Court', 'Air Conditioned', 'Dolby Atmos', 'IMAX', 'Online Booking', 'M-Ticket', 'WiFi'],
    totalScreens: 11,
    mapLink: 'https://maps.google.com/?q=PVR+Phoenix+Mall+Mumbai',
    isActive: true
  },
  {
    name: 'INOX - R City Mall',
    city: 'Mumbai',
    address: 'R City Mall, LBS Marg, Ghatkopar West, Mumbai - 400086',
    pincode: '400086',
    phone: '18601088888',
    email: 'inox.rcity@inoxmovies.com',
    facilities: ['Parking', 'Food Court', 'Air Conditioned', '4DX', 'Online Booking', 'M-Ticket', 'Recliner Seats'],
    totalScreens: 8,
    mapLink: 'https://maps.google.com/?q=INOX+R+City+Mall+Mumbai',
    isActive: true
  },
  {
    name: 'PVR ICON - DLF Cyberhub',
    city: 'Delhi',
    address: 'DLF Cyberhub, DLF Cyber City, Gurugram, Delhi NCR - 122002',
    pincode: '122002',
    phone: '18600208181',
    email: 'pvr.cyberhub@pvrcinemas.com',
    facilities: ['Parking', 'Food Court', 'Air Conditioned', 'Dolby Atmos', 'IMAX', 'Recliner Seats', 'Lounge', 'Online Booking', 'M-Ticket'],
    totalScreens: 9,
    mapLink: 'https://maps.google.com/?q=PVR+ICON+DLF+Cyberhub+Gurugram',
    isActive: true
  },
  {
    name: 'INOX - Forum Mall',
    city: 'Bangalore',
    address: 'The Forum Mall, 21 Hosur Road, Koramangala, Bengaluru - 560095',
    pincode: '560095',
    phone: '18601088888',
    email: 'inox.forum@inoxmovies.com',
    facilities: ['Parking', 'Food Court', 'Air Conditioned', '3D', 'Online Booking', 'M-Ticket', 'Wheelchair Access'],
    totalScreens: 6,
    mapLink: 'https://maps.google.com/?q=INOX+Forum+Mall+Bangalore',
    isActive: true
  },
  {
    name: 'Cinepolis - VR Mall',
    city: 'Chennai',
    address: 'VR Mall, Grand Southern Trunk Road, Guindy, Chennai - 600032',
    pincode: '600032',
    phone: '18002081003',
    email: 'vrmall@cinepolis.in',
    facilities: ['Parking', 'Food Court', 'Air Conditioned', 'Dolby Atmos', 'Online Booking', 'M-Ticket'],
    totalScreens: 7,
    mapLink: 'https://maps.google.com/?q=Cinepolis+VR+Mall+Chennai',
    isActive: true
  },
  {
    name: 'PVR Cinemas - Quest Mall',
    city: 'Kolkata',
    address: 'Quest Mall, 33 Syed Amir Ali Avenue, Kolkata - 700019',
    pincode: '700019',
    phone: '18600208181',
    email: 'pvr.quest@pvrcinemas.com',
    facilities: ['Parking', 'Food Court', 'Air Conditioned', 'IMAX', 'Online Booking', 'M-Ticket'],
    totalScreens: 5,
    mapLink: 'https://maps.google.com/?q=PVR+Quest+Mall+Kolkata',
    isActive: true
  },
  {
    name: 'AMB Cinemas',
    city: 'Hyderabad',
    address: 'AMB Mall, Financial District, Nanakramguda, Hyderabad - 500032',
    pincode: '500032',
    phone: '04048567890',
    email: 'info@ambcinemas.com',
    facilities: ['Parking', 'Food Court', 'Air Conditioned', 'Dolby Atmos', '4DX', 'Recliner Seats', 'Online Booking', 'M-Ticket', 'Lounge'],
    totalScreens: 10,
    mapLink: 'https://maps.google.com/?q=AMB+Cinemas+Hyderabad',
    isActive: true
  }
];

const offersData = [
  {
    title: 'Opening Day Special - 30% OFF',
    description: 'Get 30% discount on all movie tickets. Valid for first-time bookings on IMovies!',
    couponCode: 'IMOVIES30',
    discountType: 'percentage',
    discountValue: 30,
    maxDiscount: 200,
    minOrderAmount: 300,
    expiryDate: new Date('2025-12-31'),
    usageLimit: 1000,
    isActive: true,
    applicableFor: 'new_users'
  },
  {
    title: 'Weekend Bonanza - Flat ₹100 OFF',
    description: 'Flat ₹100 off on weekend bookings. Sit back, relax, and enjoy the show!',
    couponCode: 'WEEKEND100',
    discountType: 'flat',
    discountValue: 100,
    minOrderAmount: 400,
    expiryDate: new Date('2025-12-31'),
    isActive: true,
    applicableFor: 'all'
  },
  {
    title: 'HDFC Bank Exclusive - 20% OFF',
    description: 'HDFC Bank credit and debit card holders get 20% off on all bookings.',
    couponCode: 'HDFC20',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 150,
    minOrderAmount: 200,
    expiryDate: new Date('2025-06-30'),
    isActive: true,
    applicableFor: 'specific_bank',
    bankName: 'HDFC'
  },
  {
    title: 'Student Special - 25% OFF',
    description: 'Students get 25% off with valid student ID. Knowledge is power, savings are sweeter!',
    couponCode: 'STUDENT25',
    discountType: 'percentage',
    discountValue: 25,
    maxDiscount: 125,
    minOrderAmount: 200,
    expiryDate: new Date('2025-12-31'),
    isActive: true,
    applicableFor: 'all'
  },
  {
    title: 'Family Pack - Flat ₹200 OFF',
    description: 'Book 4 or more tickets and get flat ₹200 off. Enjoy movie night with your family!',
    couponCode: 'FAMILY200',
    discountType: 'flat',
    discountValue: 200,
    minOrderAmount: 800,
    expiryDate: new Date('2025-12-31'),
    isActive: true,
    applicableFor: 'all'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Showtime.deleteMany({}),
      Offer.deleteMany({}),
      Booking.deleteMany({})
    ]);
    console.log('✅ Cleared existing data');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      password: 'Admin@123',
      role: 'admin',
      city: 'Mumbai',
      phone: '9876543210'
    });
    console.log('✅ Admin created: admin@imovies.com / Admin@123');

    // Create demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'user@imovies.com',
      password: 'User@123',
      role: 'user',
      city: 'Delhi',
      phone: '9876543211'
    });
    console.log('✅ Demo user created: user@imovies.com / User@123');

    // Create movies
    console.log('🎬 Seeding movies...');
    const movies = await Movie.insertMany(moviesData);
    console.log(`✅ Created ${movies.length} movies`);

    // Create theatres
    console.log('🏛️  Seeding theatres...');
    const theatres = await Theatre.insertMany(theatresData);
    console.log(`✅ Created ${theatres.length} theatres`);

    // Create offers
    console.log('🎁 Seeding offers...');
    await Offer.insertMany(offersData);
    console.log('✅ Created offers');

    // Create showtimes
    console.log('📅 Creating showtimes...');
    const showtimesData = [];
    const nowShowingMovies = movies.filter(m => m.status === 'now_showing');
    const timings = ['10:00', '13:30', '17:00', '20:30'];
    const formats = ['2D', '3D', 'IMAX'];

    // Create showtimes for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      date.setHours(0, 0, 0, 0);

      for (const movie of nowShowingMovies.slice(0, 6)) {
        for (const theatre of theatres.slice(0, 4)) {
          for (const time of timings.slice(0, 2)) {
            const format = formats[Math.floor(Math.random() * 2)];
            const language = movie.language[0];

            const seats = [];
            const platinumRows = 2, goldRows = 4, silverRows = 4, seatsPerRow = 10;
            let rowIndex = 0;

            for (let i = 0; i < platinumRows; i++) {
              const row = String.fromCharCode(65 + rowIndex++);
              for (let j = 1; j <= seatsPerRow; j++) {
                seats.push({ seatNumber: `${row}${j}`, row, category: 'Platinum', isBooked: false, isBlocked: false });
              }
            }
            for (let i = 0; i < goldRows; i++) {
              const row = String.fromCharCode(65 + rowIndex++);
              for (let j = 1; j <= seatsPerRow; j++) {
                seats.push({ seatNumber: `${row}${j}`, row, category: 'Gold', isBooked: false, isBlocked: false });
              }
            }
            for (let i = 0; i < silverRows; i++) {
              const row = String.fromCharCode(65 + rowIndex++);
              for (let j = 1; j <= seatsPerRow; j++) {
                seats.push({ seatNumber: `${row}${j}`, row, category: 'Silver', isBooked: false, isBlocked: false });
              }
            }

            // Randomly book some seats for realism
            const bookedCount = Math.floor(Math.random() * 30);
            for (let b = 0; b < bookedCount; b++) {
              const idx = Math.floor(Math.random() * seats.length);
              seats[idx].isBooked = true;
            }

            const [h, m] = time.split(':').map(Number);
            const totalMin = h * 60 + m + movie.duration;
            const endH = Math.floor(totalMin / 60) % 24;
            const endM = totalMin % 60;
            const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

            showtimesData.push({
              movie: movie._id,
              theatre: theatre._id,
              date,
              startTime: time,
              endTime,
              format,
              language,
              pricing: { Silver: 150, Gold: 250, Platinum: 400 },
              seats,
              totalSeats: seats.length,
              availableSeats: seats.filter(s => !s.isBooked && !s.isBlocked).length,
              isActive: true
            });
          }
        }
      }
    }

    // Batch insert showtimes
    const createdShowtimes = [];
    for (let i = 0; i < showtimesData.length; i += 50) {
      const inserted = await Showtime.insertMany(showtimesData.slice(i, i + 50));
      createdShowtimes.push(...inserted);
    }
    console.log(`✅ Created ${createdShowtimes.length} showtimes`);

    // Create sample bookings for Demo User so Dashboard & My Bookings show active data immediately
    console.log('🎟️  Creating sample bookings...');
    const QRCode = require('qrcode');
    const sampleShowtimes = createdShowtimes.slice(0, 3);
    for (let idx = 0; idx < sampleShowtimes.length; idx++) {
      const st = sampleShowtimes[idx];
      const seats = [
        { seatNumber: 'C4', row: 'C', category: 'Gold', price: 250 },
        { seatNumber: 'C5', row: 'C', category: 'Gold', price: 250 }
      ];
      const totalAmount = 500;
      const convenienceFee = 10;
      const finalAmount = 510;
      const bookingId = `IMV${Date.now().toString(36).toUpperCase()}${idx}`;
      const qrData = JSON.stringify({ bookingId, seats: ['C4', 'C5'] });
      const qrCode = await QRCode.toDataURL(qrData);

      await Booking.create({
        bookingId,
        user: demoUser._id,
        showtime: st._id,
        selectedSeats: seats,
        totalAmount,
        convenienceFee,
        discountAmount: 0,
        finalAmount,
        paymentStatus: 'completed',
        paymentMethod: 'demo',
        paymentId: `PAY_DEMO_${Date.now()}_${idx}`,
        bookingStatus: 'confirmed',
        qrCode
      });
    }
    console.log('✅ Created sample bookings');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@imovies.com / Admin@123');
    console.log('   User:  user@imovies.com / User@123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
