module.exports = {
  getStartDay: () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  },

  getEndDay: () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }
}
