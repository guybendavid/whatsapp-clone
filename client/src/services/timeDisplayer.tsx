const timeDisplayer = (date?: string) => {
  let time = "";

  const handleEdgeCases = (timePart: string | number) => {
    return timePart = timePart < 10 ? `0${timePart}` : timePart;
  };

  if (date) {
    let hours: string | number = new Date(date).getHours();
    let minutes: string | number = new Date(date).getMinutes();
    hours = handleEdgeCases(hours);
    minutes = handleEdgeCases(minutes);
    time = `${hours}:${minutes}`;
  }

  return time;
};

export default timeDisplayer;