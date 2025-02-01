import { useFormatter } from 'next-intl';

export default function FormattedDate
    ({ date }: { date: Date })
{
    let fmt = useFormatter();
    let d = fmt.dateTime(date, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric"
    });

    return <span>{d}</span>;
}
