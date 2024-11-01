import { getAllServices, ServiceBrief } from "@/lib/pods";
import { enforceAuthAndVerify } from "@/lib/session";
import OpenRight from "../svg/OpenRight";

async function ServiceRow({
    service
}: {
    service: ServiceBrief
}) {
    return <tr className="space-x-4 pb-2 border-gray-600 border-b-2 my-10 align-top">
        <td className="pr-6 py-2 whitespace-nowrap">{ service.pod }</td>
        <td className="pr-6 py-2 whitespace-nowrap">{ service.name }</td>
        <td className="pr-6 py-2 whitespace-normal align-sub text-left">{ service.description }</td>
        <td className="pr-1 py-2 whitespace-normal align-sub text-right"><button><OpenRight /></button></td>
    </tr>;
}


export default async function Services() {
    let services = await getAllServices();

    return await enforceAuthAndVerify() ?? <div>
        <h1 className="pb-4 text-2xl font-bold">Services</h1>
        <table className="table-auto">
            <thead className="border-gray-600 border-b-2">
                <tr>
                    <th className="text-left">Pod</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Description</th>
                    <th className="text-right w-10">Options</th>
                </tr>
            </thead>
            <tbody>
                { services.map((el, idx) => <ServiceRow service={el} key={idx} />) }
            </tbody>
        </table>
    </div>;
}