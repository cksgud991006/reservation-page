export const formatFlightName = (flightNumber: string, departureTime: string) => {
    const date = new Date(departureTime);
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
    return `${flightNumber} - ${formattedDate}`;
};