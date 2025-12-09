/**
 * Formats a date string or Date object into a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string like "on 9 Dec, 2025 at 6:11 PM"
 */
const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  // Pad minutes with leading zero if needed
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${day} ${month}, ${year} at ${hours}:${minutesStr} ${ampm}`;
};

export default formatDate;
