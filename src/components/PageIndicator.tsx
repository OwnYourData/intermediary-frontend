"use client";

import Left from "@/app/svg/Left";
import Right from "@/app/svg/Right";


export default function PageIndicator({
    prefetch,
    redirect,
    first,
    curr,
    last,
    prev,
    next
}: {
    prefetch: any,
    redirect: any,
    first: number,
    curr: number,
    last: number,
    prev?: number,
    next?: number
}) {
    let shouldPrefetch = [first, curr, last];
    if(prev) shouldPrefetch.push(prev);
    if(next) shouldPrefetch.push(next);
    prefetch(shouldPrefetch);

    let makeButton = (page_id: number, innerHtml?: JSX.Element, selected: boolean = false) =>
        <button onClick={() => redirect(page_id)} className={"w-10 h-10 rounded mr-2 text-center " + (selected ? "dark:bg-gray-600 bg-gray-300" : "dark:bg-gray-700 bg-gray-400")}>{innerHtml ?? page_id}</button>;

    let shouldShowFirst = curr != first;
    let shouldShowPrevNum = prev && prev != first;
    let shouldShowNextNum = next && next != last;
    let shouldShowLast = curr != last;

    return (
        <div className="flex flex-row ">
            { prev ? makeButton(prev, <Left />) : undefined }
            { shouldShowFirst ? makeButton(first) : undefined }
            { shouldShowPrevNum ? makeButton(prev!!) : undefined }
            { makeButton(curr, undefined, true) }
            { shouldShowNextNum ? makeButton(next!!) : undefined }
            { shouldShowLast ? makeButton(last) : undefined }
            { next ? makeButton(next, <Right />) : undefined }
        </div>
    );
};