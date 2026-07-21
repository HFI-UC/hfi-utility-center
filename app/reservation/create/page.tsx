export default function ReservationCreate() {
    const formatTime = (date: Date): string =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
    ).padStart(2, "0")}`;

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatTableDate = (time: string) => {
        const date = new Date(time);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const formatTableWeekDay = (days: number[]) => {
        const daysMapping = [""];
        return days.map((item) => daysMapping[item]).join(" ");
    };

    const formatTableTime = (startTime: string, endTime: string) => {
        return `${formatTime(new Date(startTime))} - ${formatTime(
            new Date(endTime)
        )}`;
    };

    return (
        <></>
    )
}