export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? m + 'm' : ''}`;
};

export const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('embed')) return url;
  const match = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/))(\S+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getRatingColor = (rating) => {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 6) return 'text-yellow-400';
  return 'text-red-400';
};

export const getStatusBadge = (status) => {
  const badges = {
    now_showing: { label: 'Now Showing', class: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    coming_soon: { label: 'Coming Soon', class: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    ended: { label: 'Ended', class: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  };
  return badges[status] || badges.now_showing;
};

export const generateDateRange = (days = 7) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
