export default function FormattedDate
    ({ date }: { date: Date })
{
    let day = date.getDate().toString();
    let mth = (date.getMonth() + 1).toString();
    let year = date.getFullYear().toString();
    day = day.length == 1 ? `0${day}` : day;
    mth = mth.length == 1 ? `0${mth}` : mth;
    return <span>{day}/{mth}/{year}</span>;
}
